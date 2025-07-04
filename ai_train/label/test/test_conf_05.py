#!/usr/bin/env python3
# test_and_visualize_with_class_thresholds_fixed_conf.py

import os
import cv2
import torch
import yaml
import csv
from tqdm import tqdm
from ultralytics import YOLO
from pathlib import Path

# ——————————————————————————————————————————————
# 유저 설정 부분
MODEL_WEIGHTS = '/home/t25119/aiLab/rules/model/laundry_labels_cls.pt'
DATA_YAML     = '/home/t25119/aiLab/labels_detect_cls/data/laundry_data_2/data.yaml'
IMAGE_DIR     = '/home/t25119/aiLab/labels_detect_cls/data/laundry_data_2/test/images'
OUTPUT_DIR    = '/home/t25119/aiLab/labels_detect_cls/test/output/laundry_labels_cls_pred_fixed_conf_05'
IMG_SIZE      = 1056
CONF_THRESH   = 0.5   # 전 클래스 공통 confidence threshold
# ——————————————————————————————————————————————

device = 'cuda:0' if torch.cuda.is_available() else 'cpu'
print(f"Running on device: {device}")

# 모델 로드
model = YOLO(MODEL_WEIGHTS).to(device)

# 클래스 이름 로드
with open(DATA_YAML) as f:
    data = yaml.safe_load(f)
class_names = data['names']

# 이미지 리스트
image_paths = sorted(Path(IMAGE_DIR).glob('*.*'))
print(f"Total number of test images: {len(image_paths)}")

# 출력 디렉토리 생성
os.makedirs(OUTPUT_DIR, exist_ok=True)
predictions = []  # [img_name, class_name, conf, x1, y1, x2, y2]

PRED_COLOR = (0, 255, 0)
TEXT_COLOR = (0, 0, 255)

# 테스트 & 시각화
for img_path in tqdm(image_paths, desc="Test & visualize"):
    img = cv2.imread(str(img_path))
    h, w = img.shape[:2]

    # 모델 예측: conf=0.3, iou=0.45 (디폴트)
    results = model.predict(
        source=str(img_path),
        imgsz=IMG_SIZE,
        conf=CONF_THRESH,
        iou=0.45,
        max_det=1000,
        device=device,
        verbose=False
    )
    r = results[0]
    boxes   = r.boxes.xyxy.cpu().numpy().astype(int)  # (N,4)
    cls_ids = r.boxes.cls.cpu().numpy().astype(int)   # (N,)
    confs   = r.boxes.conf.cpu().numpy()             # (N,)

    # 오프셋 초기화 (한 이미지당)
    label_offsets = {}

    for idx, (box, cls_id, conf) in enumerate(zip(boxes, cls_ids, confs)):
        x1, y1, x2, y2 = box
        name = class_names[cls_id]

        # 박스 그리기
        cv2.rectangle(img, (x1, y1), (x2, y2), PRED_COLOR, 2)

        # 텍스트 위치 오프셋 적용
        offset = label_offsets.get(idx, 0)
        text_x = x1
        text_y = y2 + 30 + offset * 40

        cv2.putText(
            img,
            f"{name} {conf:.2f}",
            (text_x, text_y),
            cv2.FONT_HERSHEY_SIMPLEX,
            1.0,          # 글씨 크기
            TEXT_COLOR,
            3             # 두께
        )

        # 같은 박스 위에 겹치지 않도록 오프셋 증가
        label_offsets[idx] = offset + 1

        # CSV 기록
        predictions.append([
            img_path.name, name, float(conf), x1, y1, x2, y2
        ])

    # 결과 이미지 저장
    out_path = Path(OUTPUT_DIR) / img_path.name
    cv2.imwrite(str(out_path), img)

# CSV 저장
csv_path = Path(OUTPUT_DIR) / 'predictions.csv'
with open(csv_path, 'w', newline='') as f:
    writer = csv.writer(f)
    writer.writerow(['image','class_name','confidence','x1','y1','x2','y2'])
    writer.writerows(predictions)

print(f"✔ Predictions saved to '{csv_path}'")
print(f"✔ Visualizations saved to '{OUTPUT_DIR}'")
