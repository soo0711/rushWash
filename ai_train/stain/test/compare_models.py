#!/usr/bin/env python3
"""
compare_models.py

Usage example:
  python /home/t25119/aiLab/stain/test/compare_models.py \
    --models \
      /home/t25119/aiLab/stain/model/stain_yolov8s_1280_b2/weights/best.pt \
      /home/t25119/aiLab/stain/model/stain_yolov8s_1600_a1/weights/best.pt \
      /home/t25119/aiLab/stain/model/stain_yolov8s_1920_light_aug_final/weights/best.pt \
      /home/t25119/aiLab/stain/model/yolov8m_2048/weights/best.pt \
      /home/t25119/aiLab/stain/model/yolov8s_2048/weights/best.pt \
    --image-dir /home/t25119/aiLab/stain/data/test/images \
    --input-size 320 \
    --output performance_comparison.png
"""
import os
import sys
import json
import argparse
from collections import defaultdict

import numpy as np
import torch
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
    """
    1) YOLO 모델을 float32로 로드
    2) Conv+BN fuse (FP32에서 실행)
    3) GPU가 가능하면 half precision으로 변환
       → OOM 시 CPU fallback
    """
    # (1) float32로 로드
    model = YOLO(pt_path)

    if want_gpu and torch.cuda.is_available():
        try:
            # (2) Conv+BN fuse
            model.fuse()
            # (3) half precision & GPU 이동
            model = model.to("cuda:0", dtype=torch.float16)
            return model, "cuda:0"
        except RuntimeError as e:
            if "out of memory" in str(e).lower():
                print(f"[WARN] GPU OOM for {pt_path} → CPU 폴백", file=sys.stderr)
                torch.cuda.empty_cache()
            else:
                raise

    # CPU fallback (float32)
    return model, "cpu"



def find_best_conf(model, image_files, image_dir, input_size, class_names):
    n_class = len(class_names)
    # 높아봐야 1% 단위로 sweep 하니 아주 낮은 global_conf
    global_conf = 1e-3
    max_conf = np.full((len(image_files), n_class), -1.0, dtype=np.float32)
    gts = np.full(len(image_files), -1, dtype=np.int32)

    for i, fname in enumerate(tqdm(image_files, desc="→ finding conf")):
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
    cnt  = defaultdict(int)
    global_conf = min(class_conf_th.values())

    for fname in tqdm(image_files, desc="→ evaluating"):
        img = Image.open(os.path.join(image_dir, fname)).convert("RGB")
        img = crop_pad_resize(img, input_size)
        res = model(img, conf=global_conf, device=device)[0]

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

    return top1, top3, cnt


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--models", nargs="+", required=True,
                   help="5개 모델 weight 경로")
    p.add_argument("--image-dir", required=True,
                   help="테스트 이미지 폴더")
    p.add_argument("--input-size", type=int, default=320,
                   help="crop+resize input size")
    p.add_argument("--cpu", action="store_true",
                   help="강제 CPU inference")
    p.add_argument("--output", default="performance.png",
                   help="저장할 그래프 파일명")
    args = p.parse_args()

    class_names = ["blood","coffee","earth","ink","kimchi",
                   "lipstick","mustard","oil","wine"]

    image_files = [f for f in os.listdir(args.image_dir)
                   if f.lower().endswith((".jpg",".png"))]
    summary = {}

    for mp in args.models:
        name = os.path.basename(os.path.dirname(os.path.dirname(mp)))
        model, device = load_model(mp, want_gpu=not args.cpu)

        # 1) best conf 찾기
        best_conf = find_best_conf(model, image_files,
                                   args.image_dir, args.input_size,
                                   class_names)
        # JSON 저장
        with open(f"{name}_best_conf.json", "w") as f:
            json.dump(best_conf, f, indent=2)

        # 2) 평가
        top1, top3, cnt = evaluate_model(model, device,
                                         class_names, best_conf,
                                         image_files, args.image_dir,
                                         args.input_size)

        total = sum(cnt.values())
        overall1 = sum(top1[i] for i in top1) / total * 100 if total>0 else 0
        overall3 = sum(top3[i] for i in top3) / total * 100 if total>0 else 0

        summary[name] = {
            "best_conf":       best_conf,
            "per_class_cnt":   cnt,
            "per_class_top1":  top1,
            "per_class_top3":  top3,
            "overall_top1":    overall1,
            "overall_top3":    overall3
        }

    # 3) 결과 표 출력
    header = f"{'Model':<35} {'Top-1(%)':>10} {'Top-3(%)':>10}"
    print(header)
    print("-" * len(header))
    for name, v in summary.items():
        print(f"{name:<35} {v['overall_top1']:10.2f} {v['overall_top3']:10.2f}")

    # 4) 그래프 저장
    names = list(summary.keys())
    top1s = [summary[n]["overall_top1"] for n in names]
    top3s = [summary[n]["overall_top3"] for n in names]

    x = np.arange(len(names))
    width = 0.35

    fig, ax = plt.subplots(figsize=(8,4))
    ax.bar(x - width/2, top1s, width, label="Top-1")
    ax.bar(x + width/2, top3s, width, label="Top-3")
    ax.set_xticks(x)
    ax.set_xticklabels(names, rotation=45, ha="right")
    ax.set_ylabel("Accuracy (%)")
    ax.set_title("Model Performance Comparison")
    ax.legend()
    fig.tight_layout()
    plt.savefig(args.output)
    print(f"\n그래프를 '{args.output}'로 저장했습니다.")


if __name__ == "__main__":
    main()
