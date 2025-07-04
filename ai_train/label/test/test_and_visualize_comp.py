#!/usr/bin/env python3
# test_and_visualize_gpu.py

import os
import cv2
import torch
import yaml
import numpy as np
import csv
from tqdm import tqdm
from ultralytics import YOLO
from pathlib import Path

# ——————————————————————————————————————————————
# 유저 설정 부분
MODEL_WEIGHTS = '/home/t25119/aiLab/labels_detect_cls/model/luandry_data_1_yolov8l_640_train/weights/best.pt'
DATA_YAML     = '/home/t25119/aiLab/labels_detect_cls/data/luandry_data_1/data.yaml'
IMAGE_DIR     = '/home/t25119/aiLab/labels_detect_cls/data/luandry_data_1/test/images'
LABEL_DIR     = '/home/t25119/aiLab/labels_detect_cls/data/luandry_data_1/test/labels'
OUTPUT_DIR    = '/home/t25119/aiLab/labels_detect_cls/test/output/luandry_data_1_yolov8l_640_pred_test2'
CONF_THRESH   = 0.3
IMG_SIZE      = 640
# ——————————————————————————————————————————————

# 0) GPU 사용 지정
device = 'cuda:0' if torch.cuda.is_available() else 'cpu'
print(f"Running on device: {device}")

# 1) 모델 로드 & CUDA로 이동
model = YOLO(MODEL_WEIGHTS).to(device)

# 전체 평가(metrics)
metrics = model.val(data=DATA_YAML, imgsz=IMG_SIZE, conf=CONF_THRESH, device=device)
print(metrics)

# 2) 이미지 리스트 수집 및 출력
image_paths = sorted(Path(IMAGE_DIR).glob('*.*'))
total_images = len(image_paths)
print(f"Total number of test images: {total_images}")

# 3) 출력 디렉토리 및 예측 저장 리스트 초기화
os.makedirs(OUTPUT_DIR, exist_ok=True)
predictions = []  # (image_name, class_id, confidence, x1, y1, x2, y2)

# 컬러 정의 (BGR)
GT_COLOR   = (0, 0, 255)
PRED_COLOR = (0, 255, 0)

# 4) 이미지별 시각화 및 예측 저장
for img_path in tqdm(image_paths):
    img = cv2.imread(str(img_path))
    h, w = img.shape[:2]

    # 4.1) GT 박스
    label_path = Path(LABEL_DIR) / (img_path.stem + '.txt')
    if label_path.exists():
        for line in open(label_path, 'r'):
            tokens = line.split()
            if len(tokens) < 5:
                continue
            cls = int(float(tokens[0]))
            xc, yc, bw, bh = map(float, tokens[1:5])
            x1 = int((xc - bw/2) * w)
            y1 = int((yc - bh/2) * h)
            x2 = int((xc + bw/2) * w)
            y2 = int((yc + bh/2) * h)
            cv2.rectangle(img, (x1, y1), (x2, y2), GT_COLOR, 2)
            cv2.putText(img, f"gt:{cls}", (x1, y1 - 5),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.5, GT_COLOR, 1)

    # 4.2) 예측 박스 (개선된 파라미터 반영)
    results = model.predict(
        source=str(img_path),
        imgsz=IMG_SIZE,
        conf=0.03,            # 낮은 threshold로 Recall ↑
        iou=0.35,             # 완만한 NMS
        max_det=1000,         # 탐지 가능한 박스 수 ↑
        agnostic_nms=True,    # 클래스 간 억압 방지
        augment=True,         # TTA
        device=device,
        verbose=False
    )
    r = results[0]
    for box, cls_id, conf in zip(r.boxes.xyxy, r.boxes.cls, r.boxes.conf):
        x1, y1, x2, y2 = map(int, box.cpu().numpy())
        # 시각화
        cv2.rectangle(img, (x1, y1), (x2, y2), PRED_COLOR, 2)
        cv2.putText(img, f"p:{int(cls_id)} {conf:.2f}", (x1, y2 + 15),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.5, PRED_COLOR, 1)
        # 예측 결과 저장
        predictions.append([
            img_path.name,
            int(cls_id),
            float(conf),
            x1, y1, x2, y2
        ])

    # 4.3) 시각화 이미지 저장
    out_path = Path(OUTPUT_DIR) / img_path.name
    cv2.imwrite(str(out_path), img)

# 5) 예측 결과 CSV로 저장
csv_path = Path(OUTPUT_DIR) / 'predictions.csv'
with open(csv_path, 'w', newline='') as f:
    writer = csv.writer(f)
    writer.writerow(['image', 'class_id', 'confidence', 'x1', 'y1', 'x2', 'y2'])
    writer.writerows(predictions)
print(f"✔ Predictions saved to '{csv_path}'")
print(f"✔ Visualizations saved to '{OUTPUT_DIR}'")
