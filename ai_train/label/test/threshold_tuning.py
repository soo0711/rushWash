#!/usr/bin/env python3
# threshold_tuning_simple.py

import numpy as np
import torch
import yaml
from ultralytics import YOLO
from tqdm import tqdm

# ——————————————————————————————————————————————
# 사용자 설정
MODEL_WEIGHTS = '/home/t25119/aiLab/labels_detect_cls/model/luandry_data_1_yolov8m_1056_train/weights/best.pt'
DATA_YAML     = '/home/t25119/aiLab/labels_detect_cls/data/luandry_data_1/data.yaml'
IMG_SIZE      = 1056

# 그리드 서치 후보 (필요에 따라 줄여 주세요)
CONF_CANDIDATES = np.linspace(0.05, 0.75, 10)  # ← 15→10로 축소
IOU_CANDIDATES  = np.linspace(0.20, 0.65, 8)   # ← 10→8로 축소
FIXED_IOU       = 0.45

# ——————————————————————————————————————————————

device = 'cuda' if torch.cuda.is_available() else 'cpu'
print(f"▶ Running on {device}")

# 1) 모델 로드
model = YOLO(MODEL_WEIGHTS).to(device)

# 2) 데이터셋 정보 읽기
with open(DATA_YAML) as f:
    data = yaml.safe_load(f)
num_classes = len(data['names'])

# 결과 저장 배열
best_conf  = np.zeros(num_classes)
best_iou   = np.full(num_classes, FIXED_IOU)
best_map50 = np.zeros(num_classes)

# 3) 클래스별 confidence 튜닝 (IoU 고정)
print("▶ Step1: Class-wise confidence tuning (IoU=%.2f)" % FIXED_IOU)
for conf in tqdm(CONF_CANDIDATES, desc="conf grid"):
    # 모델 평가 (per-class mAP50 은 metrics.maps 에 배열로 담겨 있음)
    metrics = model.val(
        data=DATA_YAML,
        imgsz=IMG_SIZE,
        conf=conf,
        iou=FIXED_IOU,
        device=device,
        verbose=False,
        plots=False
    )
    maps = metrics.maps  # numpy array shape=(num_classes,)
    # 각 클래스별로 더 좋으면 갱신
    for k in range(num_classes):
        if maps[k] > best_map50[k]:
            best_map50[k] = maps[k]
            best_conf[k]  = conf

# 4) 클래스별 IoU 튜닝 (conf 고정)
print("\n▶ Step2: Class-wise IoU tuning")
for iou in tqdm(IOU_CANDIDATES, desc="iou grid"):
    metrics = model.val(
        data=DATA_YAML,
        imgsz=IMG_SIZE,
        conf=None,       # None 이면 내부에서 best_conf[k] 를 사용하도록 기본값이 None을 허용합니다.
        iou=iou,
        device=device,
        verbose=False,
        plots=False
    )
    maps = metrics.maps
    for k in range(num_classes):
        if maps[k] > best_map50[k]:
            best_map50[k] = maps[k]
            best_iou[k]   = iou

# 5) 최종 요약 출력
print("\n✅ 최적 임계값 요약:")
for k, name in enumerate(data['names']):
    print(f"  [{k:02d}] {name:20s} -> conf_thresh={best_conf[k]:.2f}, iou_thresh={best_iou[k]:.2f}, AP50={best_map50[k]:.3f}")
