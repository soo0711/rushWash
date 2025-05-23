#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
evaluate_performance.py

Usage:
  python evaluate_performance.py --model-version <VERSION> --model-type <stain|symbol>

Outputs performance JSON to rushWash/ai/performance/<model_type>/performance.json
"""
import argparse
import json
import os
import time
import sys
from collections import defaultdict

from PIL import Image, ImageOps
import numpy as np
import yaml
import torch
from ultralytics import YOLO

# ───── 모델 경로 (버전에 상관없이 고정) ─────
BASE_DIR            = os.path.dirname(os.path.abspath(__file__))
STAIN_MODEL_PATH = os.path.join(BASE_DIR, "stain", "stain_cls.pt")
SYMBOL_MODEL_PATH   = os.path.join(BASE_DIR, "symbol", "laundry_labels_cls.pt")

# ───── 데이터 경로 설정 ─────
STAIN_DATA_DIR      = os.path.join(BASE_DIR, "data", "stain", "test", "images")
SYMBOL_DATA_YAML    = os.path.join(BASE_DIR, "data", "symbol", "data.yaml")

# ───── 심볼 모델 평가 설정 ─────
IMG_SIZE    = 1056    # 입력 이미지 크기
CONF_THRESH = 0.5     # 전체 confidence threshold

# ───── 성능 결과 저장 경로 ─────
# React public 폴더로 변경 (ai/evaluate_performance.py 기준)
PERF_ROOT = os.path.abspath(os.path.join(BASE_DIR, os.pardir, "front", "fe-rw", "public", "performance"))

def load_yolo(pt: str, want_gpu: bool = True):
    if want_gpu and torch.cuda.is_available():
        try:
            m = YOLO(pt).to("cuda:0")
            m.fuse()
            m = m.to("cuda:0", dtype=torch.float16)
            return m, "cuda:0"
        except RuntimeError as e:
            if "out of memory" in str(e):
                torch.cuda.empty_cache()
            else:
                raise
    return YOLO(pt), "cpu"

def evaluate_stain(model_path: str, test_dir: str, size: int = 320) -> dict:
    model, device = load_yolo(model_path)
    class_names = ["blood","coffee","earth","ink","kimchi","lipstick","mustard","oil","wine"]
    conf_th     = {"blood":0.260,"coffee":0.350,"earth":0.230,"ink":0.190,
                   "kimchi":0.500,"lipstick":0.330,"mustard":0.160,"oil":0.360,"wine":0.100}
    global_conf = min(conf_th.values())

    def sq_resize(img, sz):
        w,h = img.size
        m = max(w,h)
        pad = ((m-w)//2,(m-h)//2, m-w-(m-w)//2, m-h-(m-h)//2)
        return ImageOps.expand(img, pad, fill=(0,0,0)).resize((sz,sz))

    sample_cnt = defaultdict(int)
    miss_cnt   = defaultdict(int)
    top1_ok    = defaultdict(int)
    top3_ok    = defaultdict(int)
    inf_time   = 0.0

    for fname in os.listdir(test_dir):
        if not fname.lower().endswith((".jpg",".png")):
            continue
        label = os.path.splitext(fname)[0].split("_")[0].lower()
        if label not in class_names:
            continue
        idx = class_names.index(label)
        sample_cnt[idx] += 1

        img = Image.open(os.path.join(test_dir, fname)).convert("RGB")
        img = sq_resize(img, size)

        t0 = time.time()
        res = model(img, conf=global_conf, device=device)[0]
        inf_time += time.time() - t0

        if not res.boxes:
            miss_cnt[idx] += 1
            continue

        cls  = res.boxes.cls.cpu().numpy().astype(int)
        conf = res.boxes.conf.cpu().numpy()
        keep = np.array([conf[i] >= conf_th[class_names[c]]
                         for i, c in enumerate(cls)], dtype=bool)
        cls, conf = cls[keep], conf[keep]
        if cls.size == 0:
            miss_cnt[idx] += 1
            continue

        order = conf.argsort()[::-1]
        top3  = cls[order[:3]]
        if idx == top3[0]:
            top1_ok[idx] += 1
        if idx in top3:
            top3_ok[idx] += 1

    per_class = {}
    tot_s = tot_m = tot1 = tot3 = 0
    for i, name in enumerate(class_names):
        s = sample_cnt[i]
        if s == 0:
            continue
        m, o1, o3 = miss_cnt[i], top1_ok[i], top3_ok[i]
        per_class[name] = {
            "samples":  s,
            "miss":     m,
            "top1_acc": round(o1 / s, 4),
            "top3_acc": round(o3 / s, 4),
        }
        tot_s += s; tot_m += m; tot1 += o1; tot3 += o3

    overall = {}
    if tot_s > 0:
        overall = {
            "samples":         tot_s,
            "miss":            tot_m,
            "top1_acc":        round(tot1 / tot_s, 4),
            "top3_acc":        round(tot3 / tot_s, 4),
            "accuracy":        round(tot1 / tot_s, 4),
            "precision":       round(tot1 / (tot_s - tot_m) if tot_s != tot_m else 0, 4),
            "recall":          round(tot1 / tot_s, 4),
            "inference_time": {
                "total_s":         round(inf_time, 4),
                "avg_per_image_s": round(inf_time / tot_s, 4)
            }
        }

    return {"per_class": per_class, "overall": overall}

def evaluate_symbol(model_path: str, data_yaml: str) -> dict:
    model = YOLO(model_path)
    with open(data_yaml) as f:
        data = yaml.safe_load(f)
    names = data['names']

    results = model.val(
        data=data_yaml,
        split='test',
        imgsz=IMG_SIZE,
        conf=CONF_THRESH,
        device='cuda:0' if torch.cuda.is_available() else 'cpu',
        verbose=False
    )

    present_idxs = list(results.ap_class_index)
    maps         = results.maps

    per_class = {
        names[int(idx)]: float(maps[i])
        for i, idx in enumerate(present_idxs)
    }

    mAP50             = float(np.mean(maps))
    P, R, _, mAP5095  = results.box.mean_results()
    inference_time_ms = results.speed.get('inference', 0.0)

    return {
        "mAP50":             mAP50,
        "precision":         P,
        "recall":            R,
        "mAP50-95":          mAP5095,
        "inference_time_ms": inference_time_ms,
        "per_class":         per_class
    }

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('-v','--model-version', required=True,
                        help="버전 메타로만 사용됩니다 (경로 지정엔 영향 없음)")
    parser.add_argument('-t','--model-type', choices=['stain','symbol'], required=True)
    args = parser.parse_args()

    if args.model_type == 'stain':
        w = STAIN_MODEL_PATH
        metrics = evaluate_stain(w, STAIN_DATA_DIR)
    else:
        w = SYMBOL_MODEL_PATH
        metrics = evaluate_symbol(w, SYMBOL_DATA_YAML)

    out = {
        "model_version": args.model_version,
        "model_type":    args.model_type,
        "weights_path":  w,
        "metrics":       metrics
    }

    # 결과 디렉터리 생성 및 덮어쓰기
    perf_dir = os.path.join(PERF_ROOT, args.model_type)
    os.makedirs(perf_dir, exist_ok=True)

    out_path = os.path.join(perf_dir, "performance.json")
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, indent=2)

    print(f"[Info] Performance metrics written to {out_path}")

if __name__ == '__main__':
    main()
