#!/usr/bin/env python3
# test_and_visualize_gpu.py

import os
import cv2
import torch
import yaml
import numpy as np
from tqdm import tqdm
from ultralytics import YOLO
from pathlib import Path

# ——————————————————————————————————————————————
# 유저 설정 부분
MODEL_WEIGHTS = '/home/t25119/aiLab/labels_detect_cls/model/label_detect_yolov8m_optimized/weights/best.pt'
DATA_YAML     = '/home/t25119/aiLab/labels_detect_cls/data/version1/data.yaml'
IMAGE_DIR     = '/home/t25119/aiLab/labels_detect_cls/data/version1/test/images'
LABEL_DIR     = '/home/t25119/aiLab/labels_detect_cls/data/version1/test/labels'
OUTPUT_DIR    = '/home/t25119/aiLab/labels_detect_cls/test/output/yolov8m_1600_pred_test'
CONF_THRESH   = 0.1
IMG_SIZE      = 1600
# ——————————————————————————————————————————————

# 0) GPU 사용 지정
device = 'cuda:0' if torch.cuda.is_available() else 'cpu'
print(f"Running on device: {device}")

# 1) 모델 로드 & CUDA로 이동
model = YOLO(MODEL_WEIGHTS).to(device)

# 전체 평가(metrics)
metrics = model.val(data=DATA_YAML, imgsz=IMG_SIZE, conf=CONF_THRESH, device=device)
print(metrics)

# 컬러 정의 (BGR)
GT_COLOR   = (0, 0, 255)
PRED_COLOR = (0, 255, 0)

os.makedirs(OUTPUT_DIR, exist_ok=True)

# 2) 이미지별 시각화
for img_path in tqdm(sorted(Path(IMAGE_DIR).glob('*.*'))):
    img = cv2.imread(str(img_path))
    h, w = img.shape[:2]

    # 2.1) GT 박스 (YOLO txt 포맷: cls xc yc w h + 추가 토큰 가능)
    label_path = Path(LABEL_DIR) / (img_path.stem + '.txt')
    if label_path.exists():
        for line in open(label_path, 'r'):
            tokens = line.split()
            if len(tokens) < 5:
                continue  # 좌표 정보가 부족하면 스킵
            cls = int(float(tokens[0]))
            xc, yc, bw, bh = map(float, tokens[1:5])
            x1 = int((xc - bw/2) * w)
            y1 = int((yc - bh/2) * h)
            x2 = int((xc + bw/2) * w)
            y2 = int((yc + bh/2) * h)
            cv2.rectangle(img, (x1, y1), (x2, y2), GT_COLOR, 2)
            cv2.putText(img, f"gt:{cls}", (x1, y1 - 5),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.5, GT_COLOR, 1)

    # 2.2) 예측 박스 (GPU + 동일한 해상도)
    results = model.predict(
        source=str(img_path),
        conf=CONF_THRESH,
        imgsz=IMG_SIZE,
        device=device,
        verbose=False
    )
    r = results[0]
    for box, cls_id, conf in zip(r.boxes.xyxy, r.boxes.cls, r.boxes.conf):
        x1, y1, x2, y2 = map(int, box.cpu().numpy())
        cv2.rectangle(img, (x1, y1), (x2, y2), PRED_COLOR, 2)
        cv2.putText(img, f"p:{int(cls_id)} {conf:.2f}", (x1, y2 + 15),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.5, PRED_COLOR, 1)

    # 2.3) 저장
    out_path = Path(OUTPUT_DIR) / img_path.name
    cv2.imwrite(str(out_path), img)

print(f"✔ Visualizations saved to '{OUTPUT_DIR}'")
