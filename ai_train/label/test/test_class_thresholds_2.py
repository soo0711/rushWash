#!/usr/bin/env python3
# test_and_visualize_with_class_thresholds.py

import os
import cv2
import torch
import yaml
import numpy as np
import csv
from tqdm import tqdm
from ultralytics import YOLO
from pathlib import Path
from torchvision.ops import nms

# ——————————————————————————————————————————————
# 유저 설정 부분
MODEL_WEIGHTS = '/home/t25119/aiLab/labels_detect_cls/model/luandry_data_1_yolov8l_640_train/weights/best.pt'
DATA_YAML     = '/home/t25119/aiLab/labels_detect_cls/data/luandry_data_1/data.yaml'
IMAGE_DIR     = '/home/t25119/aiLab/labels_detect_cls/data/luandry_data_1/test/images'
OUTPUT_DIR    = '/home/t25119/aiLab/labels_detect_cls/test/output/luandry_data_1_yolov8l_640_pred_test3'
IMG_SIZE      = 640

# 튜닝 결과: 클래스별 (conf_thresh, iou_thresh)
CLASS_THRESHOLDS = {
    0: (0.75, 0.45),  1: (0.13, 0.20), 2: (0.05, 0.45), 3: (0.05, 0.45),
    4: (0.05, 0.45),  5: (0.13, 0.45), 6: (0.05, 0.45), 7: (0.13, 0.45),
    8: (0.21, 0.45),  9: (0.67, 0.45),10: (0.13, 0.45),11: (0.36, 0.45),
   12: (0.05, 0.45),13: (0.05, 0.45),14: (0.13, 0.45),15: (0.13, 0.45),
   16: (0.13, 0.45),17: (0.13, 0.45),18: (0.13, 0.45),19: (0.13, 0.45),
   20: (0.21, 0.45),21: (0.13, 0.45),22: (0.13, 0.45),23: (0.05, 0.45),
   24: (0.13, 0.45),25: (0.13, 0.45),26: (0.13, 0.45),27: (0.52, 0.45),
   28: (0.05, 0.45),29: (0.05, 0.45),30: (0.00, 0.20),31: (0.05, 0.45),
   32: (0.59, 0.45),33: (0.52, 0.45),34: (0.75, 0.20),35: (0.13, 0.45),
   36: (0.05, 0.45),37: (0.13, 0.45),38: (0.05, 0.20),39: (0.13, 0.45),
   40: (0.13, 0.45),41: (0.13, 0.45),42: (0.05, 0.45),
}
# ——————————————————————————————————————————————

# 0) GPU 사용 지정
device = 'cuda:0' if torch.cuda.is_available() else 'cpu'
print(f"Running on device: {device}")

# 1) 모델 로드 & CUDA로 이동
model = YOLO(MODEL_WEIGHTS).to(device)

# 2) 클래스 이름 로드
with open(DATA_YAML) as f:
    data = yaml.safe_load(f)
class_names = data['names']

# 3) 테스트 이미지 목록
image_paths = sorted(Path(IMAGE_DIR).glob('*.*'))
print(f"Total number of test images: {len(image_paths)}")

# 4) 출력 준비
os.makedirs(OUTPUT_DIR, exist_ok=True)
predictions = []  # [img_name, class_name, conf, x1, y1, x2, y2]
PRED_COLOR = (0, 255, 0)
TEXT_COLOR = (0, 0, 255)  # 빨간색

# 5) 이미지별 처리
for img_path in tqdm(image_paths, desc="Test & visualize"):
    img = cv2.imread(str(img_path))
    h, w = img.shape[:2]

    # 5.1) 모델 예측 (아주 낮은 임계값으로 전체 후보 수집)
    results = model.predict(
        source=str(img_path),
        imgsz=IMG_SIZE,
        conf=0.0,    # 전부 뽑아서 뒤처리
        iou=1.0,     # NMS 최소 억제
        max_det=1000,
        agnostic_nms=False,
        device=device,
        verbose=False
    )
    r = results[0]
    boxes   = r.boxes.xyxy.cpu()       # Tensor[N,4]
    cls_ids = r.boxes.cls.cpu().long() # Tensor[N]
    confs   = r.boxes.conf.cpu()       # Tensor[N]

    # 5.2) 클래스별로 conf 필터 + NMS 후 최종 박스 선택
    final_idx = []
    for cls in torch.unique(cls_ids):
        cls = int(cls)
        conf_thr, iou_thr = CLASS_THRESHOLDS[cls]
        mask = (cls_ids == cls)
        b = boxes[mask]; s = confs[mask]
        if b.numel() == 0: continue

        # 1) conf 필터
        keep_conf = s >= conf_thr
        b = b[keep_conf]; s = s[keep_conf]
        if b.numel() == 0: continue

        # 2) NMS
        keep_nms = nms(b, s, iou_thr)
        orig_idxs = torch.nonzero(mask, as_tuple=False).squeeze(1)
        final_idx += orig_idxs[keep_conf.nonzero().squeeze(1)][keep_nms].tolist()

    # 5.3) 레이블 오프셋 초기화 (이미지별)
    label_offsets = {}  # {박스 인덱스: 누적 레이블 수}

    # 5.4) 시각화 & CSV 저장
    for i in final_idx:
        x1, y1, x2, y2 = map(int, boxes[i].tolist())
        cls_id = int(cls_ids[i])
        conf   = float(confs[i])
        name   = class_names[cls_id]

        # 박스 그리기
        cv2.rectangle(img, (x1, y1), (x2, y2), PRED_COLOR, 2)

        # 누적된 오프셋 만큼 아래로 텍스트 위치 조정
        offset = label_offsets.get(i, 0)
        text_x = x1
        text_y = y2 + 30 + offset * 40  # 각 레이블마다 40px 아래로 이동

        # 텍스트 그리기
        cv2.putText(
            img,
            f"{name} {conf:.2f}",
            (text_x, text_y),
            cv2.FONT_HERSHEY_SIMPLEX,
            1.0,         # fontScale
            TEXT_COLOR,
            3            # thickness
        )

        # 같은 박스 위에 다음 레이블이 겹치지 않도록 오프셋 +1
        label_offsets[i] = offset + 1

        # CSV 기록
        predictions.append([
            img_path.name, name, conf, x1, y1, x2, y2
        ])

    # 5.5) 결과 이미지 저장
    out_path = Path(OUTPUT_DIR) / img_path.name
    cv2.imwrite(str(out_path), img)

# 6) CSV 저장
csv_path = Path(OUTPUT_DIR) / 'predictions.csv'
with open(csv_path, 'w', newline='') as f:
    writer = csv.writer(f)
    writer.writerow(['image','class_name','confidence','x1','y1','x2','y2'])
    writer.writerows(predictions)

print(f"✔ Predictions saved to '{csv_path}'")
print(f"✔ Visualizations saved to '{OUTPUT_DIR}'")
