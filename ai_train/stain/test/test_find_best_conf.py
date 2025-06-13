#!/usr/bin/env python3
"""
test_find_best_conf.py  (FP16 로드 + OOM 시 CPU 폴백)
"""
from ultralytics import YOLO
from PIL import Image, ImageOps
from collections import defaultdict
import numpy as np, torch, json, os, argparse, tqdm, sys

def crop_pad_resize(img, size=320):
    w, h = img.size
    m = max(w, h)
    pad = ((m-w)//2, (m-h)//2, m-w-(m-w)//2, m-h-(m-h)//2)
    return ImageOps.expand(img, pad, fill=(0,0,0)).resize((size, size))

def load_model(pt_path, want_gpu=True):
    """FP16로 GPU에 올려보고 OOM이면 CPU 폴백"""
    if want_gpu and torch.cuda.is_available():
        try:
            model = YOLO(pt_path).to("cuda:0", dtype=torch.float16)
            return model, "cuda:0"
        except RuntimeError as e:
            if "out of memory" in str(e):
                print("[WARN] GPU OOM → CPU 폴백", file=sys.stderr)
                torch.cuda.empty_cache()
            else:
                raise
    # CPU 로드
    model = YOLO(pt_path)
    return model, "cpu"

def main(args):
    # 0. 모델 로드
    model, infer_device = load_model(args.model, want_gpu=not args.cpu)

    class_names = ["blood","coffee","earth","ink","kimchi",
                   "lipstick","mustard","oil","wine"]
    n_class = len(class_names)
    global_conf = 0.001                           # PR 스윕용

    # 데이터 준비
    img_files = [f for f in os.listdir(args.image_dir)
                 if f.lower().endswith((".jpg",".png"))]
    max_conf = np.full((len(img_files), n_class), -1.0, dtype=np.float32)
    gts      = np.full(len(img_files), -1, dtype=np.int32)

    for i, fname in enumerate(tqdm.tqdm(img_files, desc="Infer")):
        gt_lab = fname.split("_")[0].lower()
        if gt_lab not in class_names:
            continue
        gts[i] = class_names.index(gt_lab)

        img = crop_pad_resize(Image.open(os.path.join(args.image_dir, fname)).convert("RGB"),
                              args.input_size)
        res = model(img, conf=global_conf, device=infer_device)[0]

        if len(res.boxes):
            cls  = res.boxes.cls.cpu().numpy().astype(int)
            conf = res.boxes.conf.cpu().numpy()
            for c, cf in zip(cls, conf):
                max_conf[i, c] = max(max_conf[i, c], cf)

    thr = np.linspace(0, 1, 101, dtype=np.float32)
    best_conf = {}
    for ci, cname in enumerate(class_names):
        conf_vec = max_conf[:, ci]; gt_mask = (gts == ci)
        if gt_mask.sum() == 0:
            best_conf[cname] = 0.5; continue
        best_f1, best_t = -1, 0.5
        for t in thr:
            pred = conf_vec >= t
            tp = np.logical_and(pred, gt_mask).sum()
            fp = np.logical_and(pred, ~gt_mask).sum()
            fn = np.logical_and(~pred, gt_mask).sum()
            if tp + fp == 0: continue
            prec, rec = tp/(tp+fp), tp/(tp+fn)
            if prec + rec == 0: continue
            f1 = 2*prec*rec/(prec+rec)
            if f1 > best_f1:
                best_f1, best_t = f1, t
        best_conf[cname] = round(float(best_t), 3)

    with open("best_conf.json","w") as f: json.dump(best_conf,f,indent=2)
    print("\n=== Best conf (F1-opt) ===")
    for k,v in best_conf.items(): print(f"{k:<10}: {v:.3f}")

# ------------------------------------------------------------
if __name__ == "__main__":
    p = argparse.ArgumentParser()
    p.add_argument("--model", default="/home/t25119/aiLab/model/best.pt")
    p.add_argument("--image_dir",
                   default="/home/t25119/aiLab/stain/data/test/images")
    p.add_argument("--input_size", type=int, default=320)
    p.add_argument("--cpu", action="store_true",
                   help="강제로 CPU 사용")
    main(p.parse_args())
