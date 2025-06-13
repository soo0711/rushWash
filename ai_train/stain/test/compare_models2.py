#!/usr/bin/env python3
"""
compare_models2.py

Usage example:
  python /home/t25119/aiLab/stain/test/compare_models2.py \
    --models \
      /home/t25119/aiLab/stain/model/stain_yolov8s_1280_b2/weights/best.pt \
      /home/t25119/aiLab/stain/model/stain_yolov8s_1600_a1/weights/best.pt \
      /home/t25119/aiLab/stain/model/stain_yolov8s_1920_light_aug_final/weights/best.pt \
      /home/t25119/aiLab/stain/model/yolov8m_2048/weights/best.pt \
      /home/t25119/aiLab/stain/model/yolov8s_2048/weights/best.pt \
    --image-dir /home/t25119/aiLab/stain/data/test/images \
    --input-size 320 \
    --data-yaml /home/t25119/aiLab/stain/data/data.yaml \
    --output performance_comparison.png
"""
import os
import sys
import json
import time
import argparse
from collections import defaultdict

import numpy as np
import torch
# limit GPU allocation to ~1GB
if torch.cuda.is_available():
    dev = torch.cuda.current_device()
    total_mem = torch.cuda.get_device_properties(dev).total_memory
    frac = (1 * 1024**3) / total_mem
    torch.cuda.set_per_process_memory_fraction(frac, device=dev)
    os.environ["PYTORCH_CUDA_ALLOC_CONF"] = "max_split_size_mb:8"

from ultralytics import YOLO
from PIL import Image, ImageOps
import matplotlib.pyplot as plt
from tqdm import tqdm


def crop_pad_resize(img, size):
    w, h = img.size
    m = max(w, h)
    pad = ((m - w)//2, (m - h)//2, m - w - (m - w)//2, m - h - (m - h)//2)
    return ImageOps.expand(img, pad, fill=(0, 0, 0)).resize((size, size))


def load_model(pt_path, want_gpu=True):
    model = YOLO(pt_path)
    if want_gpu and torch.cuda.is_available():
        try:
            model.fuse()
            model = model.to("cuda:0", dtype=torch.float16)
            return model, "cuda:0"
        except RuntimeError as e:
            if "out of memory" in str(e).lower():
                print(f"[WARN] GPU OOM for {pt_path} -> CPU fallback", file=sys.stderr)
                torch.cuda.empty_cache()
            else:
                raise
    return model, "cpu"


def find_best_conf(model, image_files, image_dir, input_size, class_names):
    n_class = len(class_names)
    global_conf = 1e-3
    max_conf = np.full((len(image_files), n_class), -1.0, dtype=np.float32)
    gts = np.full(len(image_files), -1, dtype=np.int32)

    for i, fname in enumerate(tqdm(image_files, desc="-> finding conf")):
        gt = fname.split("_")[0].lower()
        if gt not in class_names:
            continue
        idx = class_names.index(gt)
        gts[i] = idx

        img = Image.open(os.path.join(image_dir, fname)).convert("RGB")
        img = crop_pad_resize(img, input_size)
        res = model(img, conf=global_conf)[0]

        for c, cf in zip(res.boxes.cls.cpu().numpy().astype(int),
                         res.boxes.conf.cpu().numpy()):
            max_conf[i, c] = max(max_conf[i, c], cf)

    thr = np.linspace(0, 1, 101, dtype=np.float32)
    best_conf = {}
    for ci, cname in enumerate(class_names):
        vec = max_conf[:, ci]
        mask = (gts == ci)
        if mask.sum() == 0:
            best_conf[cname] = 0.5
            continue
        best_f1, best_t = -1, 0.5
        for t in thr:
            pred = vec >= t
            tp = np.logical_and(pred, mask).sum()
            fp = np.logical_and(pred, ~mask).sum()
            fn = np.logical_and(~pred, mask).sum()
            if tp + fp == 0 or tp + fn == 0:
                continue
            prec = tp / (tp + fp)
            rec = tp / (tp + fn)
            f1 = 2 * prec * rec / (prec + rec)
            if f1 > best_f1:
                best_f1, best_t = f1, t
        best_conf[cname] = float(round(best_t, 3))

    return best_conf


def evaluate_model(model, device, class_names, class_conf_th,
                   image_files, image_dir, input_size):
    top1 = defaultdict(int)
    top3 = defaultdict(int)
    cnt = defaultdict(int)
    times = []
    global_conf = min(class_conf_th.values())

    for fname in tqdm(image_files, desc="-> evaluating"):
        img = Image.open(os.path.join(image_dir, fname)).convert("RGB")
        img = crop_pad_resize(img, input_size)

        t0 = time.time()
        res = model(img, conf=global_conf, device=device)[0]
        t1 = time.time()
        times.append(t1 - t0)

        cls = res.boxes.cls.cpu().numpy().astype(int)
        prob = res.boxes.conf.cpu().numpy()
        keep = [p >= class_conf_th[class_names[c]] for c, p in zip(cls, prob)]
        cls = cls[keep]
        prob = prob[keep]
        if cls.size == 0:
            continue

        order = prob.argsort()[::-1]
        top3_preds = cls[order[:3]]

        gt = fname.split("_")[0].lower()
        if gt not in class_names:
            continue
        gi = class_names.index(gt)
        cnt[gi] += 1
        if top3_preds[0] == gi:
            top1[gi] += 1
        if gi in top3_preds:
            top3[gi] += 1

    avg_latency_ms = (sum(times) / len(times)) * 1000 if times else 0
    return top1, top3, cnt, avg_latency_ms


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--models", nargs="+", required=True)
    parser.add_argument("--image-dir", required=True)
    parser.add_argument("--input-size", type=int, default=320)
    parser.add_argument("--data-yaml")
    parser.add_argument("--cpu", action="store_true")
    parser.add_argument("--output", default="performance.png")
    args = parser.parse_args()

    class_names = ["blood","coffee","earth","ink","kimchi",
                   "lipstick","mustard","oil","wine"]
    image_files = [f for f in os.listdir(args.image_dir)
                   if f.lower().endswith((".jpg",".png"))]

    summary = {}
    for mp in args.models:
        name = os.path.basename(os.path.dirname(os.path.dirname(mp)))
        model, device = load_model(mp, want_gpu=not args.cpu)

        best_conf = find_best_conf(model, image_files,
                                   args.image_dir, args.input_size,
                                   class_names)
        with open(f"{name}_best_conf.json", "w") as f:
            json.dump(best_conf, f, indent=2)

        top1, top3, cnt, latency = evaluate_model(
            model, device, class_names, best_conf,
            image_files, args.image_dir, args.input_size)

        total = sum(cnt.values())
        overall1 = sum(top1.values()) / total * 100 if total else 0
        overall3 = sum(top3.values()) / total * 100 if total else 0

        map50 = None
        if args.data_yaml:
            val = model.val(data=args.data_yaml,
                             device=device, iou=0.5, verbose=False)
            if hasattr(val, 'metrics'):
                map50 = val.metrics.get('map50', val.metrics.get('mAP50'))
            elif hasattr(val, 'stats'):
                map50 = val.stats[3]
            if map50 is not None:
                map50 *= 100

        summary[name] = {
            'overall_top1': overall1,
            'overall_top3': overall3,
            'latency_ms': latency,
            'map50': map50
        }

    # print results
    hdr = f"{'Model':<25} {'Top-1%':>7} {'mAP50%':>8} {'Top-3%':>7} {'Lat(ms)':>8}"
    print(hdr)
    print('-' * len(hdr))
    for name, v in summary.items():
        m50 = f"{v['map50']:.2f}" if v['map50'] is not None else '  -  '
        print(f"{name:<25} {v['overall_top1']:7.2f} {m50:>8} {v['overall_top3']:7.2f} {v['latency_ms']:8.1f}")

    # plot
    models = list(summary.keys())
    x = np.arange(len(models))
    top1s = [summary[m]['overall_top1'] for m in models]
    top3s = [summary[m]['overall_top3'] for m in models]
    m50s  = [summary[m]['map50']    for m in models] if args.data_yaml else None
    lat   = [summary[m]['latency_ms'] for m in models]

    width = 0.25 if m50s else 0.35
    fig, ax1 = plt.subplots(figsize=(10, 5))
    if m50s:
        ax1.bar(x - width, top1s, width, label='Top-1')
        ax1.bar(x, m50s, width, label='mAP@50')
        ax1.bar(x + width, top3s, width, label='Top-3')
    else:
        ax1.bar(x - width/2, top1s, width, label='Top-1')
        ax1.bar(x + width/2, top3s, width, label='Top-3')

    ax2 = ax1.twinx()
    ax2.plot(x, lat, marker='o', linestyle='--', label='Latency(ms)')

    ax1.set_xticks(x)
    ax1.set_xticklabels(models, rotation=45, ha='right')
    ax1.set_ylabel('Accuracy/mAP (%)')
    ax2.set_ylabel('Latency (ms)')
    ax1.legend(loc='upper left')
    ax2.legend(loc='upper right')

    fig.tight_layout()
    plt.savefig(args.output)
    print(f"\nSaved comparison plot to '{args.output}'")

if __name__ == '__main__':
    main()
