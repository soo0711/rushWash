#!/usr/bin/env python3
# test_topk_per_class_conf.py

import os
import sys
from collections import defaultdict
from PIL import Image, ImageOps
import torch
import numpy as np
from ultralytics import YOLO

# ──────────────────────────────────────────────────────────────
# 0) 메모리 안전 로더 (GPU OOM → CPU 폴백)
def load_yolo(weights, want_gpu=True):
    """
    1) float32 모델을 GPU로 올린 뒤
    2) Conv+BN fuse
    3) half precision 으로 변환
    """
    # GPU 사용 요청 있고, 실제 GPU 가능할 때
    if want_gpu and torch.cuda.is_available():
        try:
            # (1) float32로 로드 & GPU 이동
            model = YOLO(weights).to("cuda:0")
            # (2) Conv+BN fuse
            model.fuse()
            # (3) half precision 으로 변환
            model = model.to("cuda:0", dtype=torch.float16)
            return model, "cuda:0"
        except RuntimeError as e:
            if "out of memory" in str(e):
                print("[WARN] GPU OOM → CPU 폴백", file=sys.stderr)
                torch.cuda.empty_cache()
            else:
                raise
    # CPU fallback
    return YOLO(weights), "cpu"

# 1) 모델 로드
model_path = "/home/t25119/aiLab/rules/model/stain_cls.pt"
model, infer_device = load_yolo(model_path)

# 2) 클래스 이름 & 클래스별 conf threshold (F1-opt)
class_names = ["blood", "coffee", "earth", "ink",
               "kimchi", "lipstick", "mustard", "oil", "wine"]

class_conf_th = {
    "blood":   0.260,
    "coffee":  0.350,
    "earth":   0.230,
    "ink":     0.190,
    "kimchi":  0.500,
    "lipstick":0.330,
    "mustard": 0.160,
    "oil":     0.360,
    "wine":    0.100,
}
global_conf = min(class_conf_th.values())  # 0.100

# 3) 테스트 이미지 경로
image_dir = "/home/t25119/aiLab/rules/data/stain/test/images"
image_files = [
    f for f in os.listdir(image_dir)
    if f.lower().endswith((".jpg", ".png"))
]

# 4) 평가 통계용 카운터
top1_correct = defaultdict(int)
top3_correct = defaultdict(int)
sample_count  = defaultdict(int)

def crop_pad_resize(img, size=320):
    """이미지 종횡비 유지하며 pad → resize"""
    w, h = img.size
    m = max(w, h)
    pad = (
        (m - w) // 2,
        (m - h) // 2,
        m - w - (m - w) // 2,
        m - h - (m - h) // 2
    )
    return ImageOps.expand(img, pad, fill=(0, 0, 0)).resize((size, size))

# ──────────────────────────────────────────────────────────────
# 5) 평가 루프
for fname in image_files:
    img_path = os.path.join(image_dir, fname)
    img = Image.open(img_path).convert("RGB")
    img = crop_pad_resize(img, size=320)

    # (a) 한번만 global_conf로 추론
    results = model(img, conf=global_conf, device=infer_device)[0]

    # (b) 박스 없으면 skip
    if len(results.boxes.cls) == 0:
        continue

    # (c) 클래스별 conf 임계치로 후-필터링
    classes = results.boxes.cls.cpu().numpy().astype(int)
    probs   = results.boxes.conf.cpu().numpy()
    keep = np.array([
        p >= class_conf_th[class_names[c]]
        for c, p in zip(classes, probs)
    ], dtype=bool)
    classes, probs = classes[keep], probs[keep]
    if len(classes) == 0:
        continue

    # (d) Top-3 선택
    sorted_idx = probs.argsort()[::-1]
    top3 = classes[sorted_idx[:3]]

    # (e) GT 레이블 추출
    gt_label = os.path.splitext(fname)[0].split("_")[0].lower()
    if gt_label not in class_names:
        continue
    gt_idx = class_names.index(gt_label)

    # (f) 통계 업데이트
    sample_count[gt_idx] += 1
    if gt_idx == top3[0]:
        top1_correct[gt_idx] += 1
    if gt_idx in top3:
        top3_correct[gt_idx] += 1

# ──────────────────────────────────────────────────────────────
# 6) 결과 출력
print(f"\n{'클래스':<15} {'샘플 수':<10} {'Top-1 Acc':<12} Top-3 Acc")
print("-" * 50)

total_samples = total_top1 = total_top3 = 0
for idx, name in enumerate(class_names):
    cnt = sample_count[idx]
    if cnt == 0:
        continue
    acc1 = top1_correct[idx] / cnt * 100
    acc3 = top3_correct[idx] / cnt * 100
    print(f"{name:<15} {cnt:<10} {acc1:>6.2f}%       {acc3:>6.2f}%")
    total_samples += cnt
    total_top1     += top1_correct[idx]
    total_top3     += top3_correct[idx]

print("-" * 50)
if total_samples > 0:
    overall1 = total_top1 / total_samples * 100
    overall3 = total_top3 / total_samples * 100
    print(f"{'전체 평균':<15} {total_samples:<10} {overall1:>6.2f}%      {overall3:>6.2f}%")
else:
    print("❗ 전체 샘플 수가 0입니다.")
