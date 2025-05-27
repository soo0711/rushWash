#!/usr/bin/env python3
"""
This script fetches images from the MySQL database, filters them by estimation=1, matches label .txt files,
copies them into the YOLO-style train folders for stain and symbol, retrains both models,
and then evaluates their performance, outputting JSON metrics files.
Each retraining run is saved under ai/model/stain/<run_number> and ai/model/symbol/<run_number>.
Model version is the run number divided by 10, and model type is inferred automatically.
"""
import os
import shutil
import json
import time
import mysql.connector
from mysql.connector import Error
import yaml
import torch
import numpy as np
from PIL import Image, ImageOps
from collections import defaultdict
from ultralytics import YOLO

# ---------------- Database Configuration ---------------- #
HOST = 'localhost'
PORT = 0000
USER = 'your_db_user'
PASSWORD = 'your_db_password'
DATABASE = 'db25119'

DB_CONFIG = {
    'host': HOST,
    'port': PORT,
    'user': USER,
    'password': PASSWORD,
    'database': DATABASE,
}

# ---------------- Source Directories ---------------- #
STAIN_IMAGE_DIR     = 'v109.src/images/output/stain/images'
STAIN_LABEL_DIR     = 'v109.src/images/output/stain/labels'
SYMBOL_IMAGE_DIR    = 'v109.src/images/output/symbol/images'
SYMBOL_LABEL_DIR    = 'v109.src/images/output/symbol/labels'

# ---------------- YOLO Data Directories ---------------- #
TRAIN_STAIN_IMG_DIR    = 'v109.src/ai/data/stain/train/images'
TRAIN_STAIN_LABEL_DIR  = 'v109.src/ai/data/stain/train/labels'
TRAIN_SYMBOL_IMG_DIR   = 'v109.src/ai/data/symbol/train/images'
TRAIN_SYMBOL_LABEL_DIR = 'v109.src/ai/data/symbol/train/labels'
STAIN_TEST_IMG_DIR     = 'v109.src/ai/data/stain/test/images'

# ---------------- Model Output Base Directories ---------------- #
MODEL_BASE_DIR_STAIN  = 'v109.src/ai/model/stain'
MODEL_BASE_DIR_SYMBOL = 'v109.src/ai/model/symbol'

# ---------------- Data YAML Paths ---------------- #
STAIN_DATA_YAML  = 'v109.src/ai/data/stain/data.yaml'
SYMBOL_DATA_YAML = 'v109.src/ai/data/symbol/data.yaml'

# ---------------- Training Hyperparameters ---------------- #
STAIN_TRAIN_CFG = {
    'data': STAIN_DATA_YAML,
    'epochs': 500,
    'patience': 150,
    'batch': 2,
    'imgsz': 1600,
    'device': 'cuda:0',
    'workers': 1,
    'optimizer': 'auto',
    'amp': True,
    'cos_lr': False,
    'mosaic': 1.0,
    'mixup': 0.0,
    'auto_augment': 'randaugment',
    'erasing': 0.4
}
SYMBOL_TRAIN_CFG = {
    'data': SYMBOL_DATA_YAML,
    'epochs': 100,
    'patience': 5,
    'batch': 2,
    'imgsz': 2048,
    'device': 'cuda:0',
    'workers': 4,
    'optimizer': 'SGD',
    'amp': True,
    'cos_lr': True,
    'augment': True,
    'mosaic': True,
    'mixup': 0.3
}

# ---------------- Performance Output ---------------- #
PERF_ROOT = 'v109.src/ai/performance'

# Ensure necessary directories
for d in [
    TRAIN_STAIN_IMG_DIR, TRAIN_STAIN_LABEL_DIR,
    TRAIN_SYMBOL_IMG_DIR, TRAIN_SYMBOL_LABEL_DIR,
    MODEL_BASE_DIR_STAIN, MODEL_BASE_DIR_SYMBOL,
    PERF_ROOT
]:
    os.makedirs(d, exist_ok=True)

# ---------------- SQL Query ---------------- #
SQL_QUERY = (
    "SELECT stain_image_url, label_image_url "
    "FROM washing_history "
    "WHERE estimation = 1 "
    "  AND (stain_image_url IS NOT NULL OR label_image_url IS NOT NULL);"
)

# ---------------- Data Preparation ---------------- #
def copy_pair(image_url, img_src_dir, lbl_src_dir, img_dst_dir, lbl_dst_dir):
    if not image_url:
        return False
    img_name = os.path.basename(image_url)
    base, _ = os.path.splitext(img_name)
    src_img = os.path.join(img_src_dir, img_name)
    src_lbl = os.path.join(lbl_src_dir, f"{base}.txt")
    if os.path.exists(src_img) and os.path.exists(src_lbl):
        shutil.copy2(src_img, os.path.join(img_dst_dir, img_name))
        shutil.copy2(src_lbl, os.path.join(lbl_dst_dir, f"{base}.txt"))
        return True
    return False


def fetch_and_prepare():
    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        cursor = conn.cursor()
        cursor.execute(SQL_QUERY)
        rows = cursor.fetchall()
        for stain_url, label_url in rows:
            if copy_pair(stain_url, STAIN_IMAGE_DIR, STAIN_LABEL_DIR,
                         TRAIN_STAIN_IMG_DIR, TRAIN_STAIN_LABEL_DIR):
                print(f"[Stain] Copied {os.path.basename(stain_url)}")
            if copy_pair(label_url, SYMBOL_IMAGE_DIR, SYMBOL_LABEL_DIR,
                         TRAIN_SYMBOL_IMG_DIR, TRAIN_SYMBOL_LABEL_DIR):
                print(f"[Symbol] Copied {os.path.basename(label_url)}")
    except Error as e:
        print(f"Error connecting to DB: {e}")
    finally:
        if 'conn' in locals() and conn.is_connected():
            cursor.close()
            conn.close()

# ---------------- Run Naming ---------------- #
def get_next_run_name(base_dir):
    existing = [d for d in os.listdir(base_dir) if os.path.isdir(os.path.join(base_dir, d))]
    nums = [int(d) for d in existing if d.isdigit()]
    return str(max(nums) + 1) if nums else '1'

# ---------------- Evaluation Functions ---------------- #
def load_yolo(pt, want_gpu=True):
    if want_gpu and torch.cuda.is_available():
        try:
            m = YOLO(pt).to('cuda:0'); m.fuse(); return m, 'cuda:0'
        except RuntimeError:
            torch.cuda.empty_cache()
    return YOLO(pt), 'cpu'


def evaluate_stain(model_path, test_dir, size=1600):
    model, device = load_yolo(model_path)
    class_names = ["blood","coffee","earth","ink","kimchi","lipstick","mustard","oil","wine"]
    conf_th = {k: v for k,v in zip(class_names, [0.26,0.35,0.23,0.19,0.5,0.33,0.16,0.36,0.1])}
    global_conf = min(conf_th.values())

    def sq_resize(img, sz):
        w,h = img.size; m = max(w,h)
        pad = ((m-w)//2,(m-h)//2,m-w-(m-w)//2,m-h-(m-h)//2)
        return ImageOps.expand(img,pad,fill=(0,0,0)).resize((sz,sz))

    cnt = defaultdict(int); miss = defaultdict(int)
    top1 = defaultdict(int); top3 = defaultdict(int)
    inf_time=0.0

    for f in os.listdir(test_dir):
        if not f.lower().endswith(('.jpg','.png')): continue
        label = f.split('_')[0].lower();
        if label not in class_names: continue
        idx = class_names.index(label); cnt[idx]+=1
        img = Image.open(os.path.join(test_dir,f)).convert('RGB')
        img = sq_resize(img,size)
        t0=time.time(); res=model(img,conf=global_conf,device=device)[0]; inf_time+=time.time()-t0
        if not res.boxes: miss[idx]+=1; continue
        cls = res.boxes.cls.cpu().numpy().astype(int)
        conf = res.boxes.conf.cpu().numpy()
        keep = [conf[i]>=conf_th[class_names[c]] for i,c in enumerate(cls)]
        cls=cls[keep]; conf=conf[keep]
        if cls.size==0: miss[idx]+=1; continue
        ords=conf.argsort()[::-1]; top3_idxs=cls[ords[:3]]
        if idx==top3_idxs[0]: top1[idx]+=1
        if idx in top3_idxs: top3[idx]+=1

    per_class={}; tot_s=tot_m=tot1=tot3=0
    for i,name in enumerate(class_names):
        s=cnt[i]; m=miss[i]; o1=top1[i]; o3=top3[i]
        if s>0:
            per_class[name]={"samples":s,"miss":m,
                              "top1_acc":round(o1/s,4),
                              "top3_acc":round(o3/s,4)}
            tot_s+=s;tot_m+=m;tot1+=o1;tot3+=o3
    overall={}
    if tot_s>0:
        overall={"samples":tot_s,"miss":tot_m,
                 "top1_acc":round(tot1/tot_s,4),
                 "top3_acc":round(tot3/tot_s,4),
                 "accuracy":round(tot1/tot_s,4),
                 "precision":round(tot1/(tot_s-tot_m),4) if tot_s!=tot_m else 0,
                 "recall":round(tot1/tot_s,4),
                 "inference_time":{
                   "total_s":round(inf_time,4),
                   "avg_per_image_s":round(inf_time/tot_s,4)}}
    return {"per_class":per_class,"overall":overall}


def evaluate_symbol(model_path, data_yaml):
    model = YOLO(model_path)
    with open(data_yaml) as f: data = yaml.safe_load(f)
    names = data['names']
    results = model.val(data=data_yaml, split='test', imgsz=1056,
                        conf=0.5, device='cuda:0' if torch.cuda.is_available() else 'cpu',
                        verbose=False)
    maps = results.maps
    per_class = {names[int(idx)]:float(maps[i])
                 for i,idx in enumerate(results.ap_class_index)}
    mAP50=float(np.mean(maps))
    P,R,_,mAP5095 = results.box.mean_results()
    inf_ms = results.speed.get('inference',0.0)
    return {"mAP50":mAP50,"precision":P,"recall":R,
            "mAP50-95":mAP5095,"inference_time_ms":inf_ms,
            "per_class":per_class}

# ---------------- Model Retraining & Evaluation ---------------- #
def retrain_and_eval():
    # ------- Retrain Stain -------
    stain_run = get_next_run_name(MODEL_BASE_DIR_STAIN)
    stain_model = YOLO('v109.src/ai/stain/stain_cls.pt')
    stain_model.train(project=MODEL_BASE_DIR_STAIN, name=stain_run, save=True, **STAIN_TRAIN_CFG)
    stain_best = os.path.join(MODEL_BASE_DIR_STAIN, stain_run, 'weights', 'best.pt')
    print(f"[Stain] Model saved to {stain_best}")
    # Eval Stain
    version_stain = round(int(stain_run)/10, 1)
    metrics_s = evaluate_stain(stain_best, STAIN_TEST_IMG_DIR)
    out_s = {"model_version":version_stain, "model_type":"stain",
             "weights_path":stain_best, "metrics":metrics_s}
    dir_s=os.path.join(PERF_ROOT,'stain'); os.makedirs(dir_s,exist_ok=True)
    path_s=os.path.join(dir_s,'performance.json')
    with open(path_s,'w',encoding='utf-8') as f: json.dump(out_s,f,ensure_ascii=False, indent=2)
    print(f"[Stain] Performance saved to {path_s}")

    # ------- Retrain Symbol -------
    symbol_run = get_next_run_name(MODEL_BASE_DIR_SYMBOL)
    symbol_model = YOLO('v109.src/ai/symbol/laundry_labels_cls.pt')
    symbol_model.train(project=MODEL_BASE_DIR_SYMBOL, name=symbol_run, save=True, **SYMBOL_TRAIN_CFG)
    symbol_best = os.path.join(MODEL_BASE_DIR_SYMBOL, symbol_run, 'weights', 'best.pt')
    print(f"[Symbol] Model saved to {symbol_best}")
    # Eval Symbol
    version_sym = round(int(symbol_run)/10, 1)
    metrics_y = evaluate_symbol(symbol_best, SYMBOL_DATA_YAML)
    out_y = {"model_version":version_sym, "model_type":"symbol",
             "weights_path":symbol_best, "metrics":metrics_y}
    dir_y=os.path.join(PERF_ROOT,'symbol'); os.makedirs(dir_y,exist_ok=True)
    path_y=os.path.join(dir_y,'performance.json')
    with open(path_y,'w',encoding='utf-8') as f: json.dump(out_y,f,ensure_ascii=False, indent=2)
    print(f"[Symbol] Performance saved to {path_y}")

# ---------------- Main ---------------- #
if __name__ == '__main__':
    print("Starting data preparation...")
    fetch_and_prepare()
    print("Starting training and evaluation...")
    retrain_and_eval()
    print("All done.")
