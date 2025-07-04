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
MODEL_WEIGHTS = '/home/t25119/aiLab/rules/model/laundry_labels_cls.pt'
DATA_YAML     = '/home/t25119/aiLab/rules/data/symbol/data.yaml'
IMAGE_DIR     = '/home/t25119/aiLab/rules/data/symbol/test/images'
LABEL_DIR     = '/home/t25119/aiLab/rules/data/symbol/test/labels'
OUTPUT_DIR    = '/home/t25119/aiLab/labels_detect_cls/test/output/symbol_test_img_class_thres'
IMG_SIZE      = 1056

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

# 2) 테스트 이미지 목록
image_paths = sorted(Path(IMAGE_DIR).glob('*.*'))
print(f"Total number of test images: {len(image_paths)}")

# 3) 출력 준비
os.makedirs(OUTPUT_DIR, exist_ok=True)
predictions = []  # [img_name, class_id, conf, x1, y1, x2, y2]

GT_COLOR   = (0, 0, 255)
PRED_COLOR = (0, 255, 0)

# 4) 이미지별 처리
for img_path in tqdm(image_paths, desc="Test & visualize"):
    img = cv2.imread(str(img_path))
    h, w = img.shape[:2]

    # 4.1) GT 박스 그리기
    label_path = Path(LABEL_DIR) / (img_path.stem + '.txt')
    if label_path.exists():
        for line in open(label_path, 'r'):
            c, xc, yc, bw, bh = map(float, line.split())
            x1 = int((xc - bw/2) * w)
            y1 = int((yc - bh/2) * h)
            x2 = int((xc + bw/2) * w)
            y2 = int((yc + bh/2) * h)
            cv2.rectangle(img, (x1, y1), (x2, y2), GT_COLOR, 2)
            cv2.putText(img, f"gt:{int(c)}", (x1, y1 - 5),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.5, GT_COLOR, 1)

    # 4.2) 모델 예측 (아주 낮은 임계값으로 전체 후보 수집)
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
    boxes   = r.boxes.xyxy.cpu()        # Tensor[N,4]
    cls_ids = r.boxes.cls.cpu().long()  # Tensor[N]
    confs   = r.boxes.conf.cpu()        # Tensor[N]

    # 4.3) 클래스별로 conf 필터 + NMS 후 최종 박스 선택
    final_idx = []
    for cls in torch.unique(cls_ids):
        cls = int(cls)
        conf_thr, iou_thr = CLASS_THRESHOLDS[cls]
        mask = (cls_ids == cls)
        b = boxes[mask]
        s = confs[mask]
        if b.numel() == 0:
            continue
        keep_conf = s >= conf_thr
        b = b[keep_conf]
        s = s[keep_conf]
        if b.numel() == 0:
            continue
        keep_nms = nms(b, s, iou_thr)
        orig_idxs = torch.nonzero(mask, as_tuple=False).squeeze(1)
        final_idx += orig_idxs[keep_conf.nonzero().squeeze(1)][keep_nms].tolist()

    # 4.4) 시각화 & CSV 저장
    for i in final_idx:
        x1, y1, x2, y2 = map(int, boxes[i].tolist())
        cls_id = int(cls_ids[i])
        conf   = float(confs[i])
        cv2.rectangle(img, (x1, y1), (x2, y2), PRED_COLOR, 2)
        cv2.putText(img, f"p:{cls_id} {conf:.2f}", (x1, y2 + 15),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.5, PRED_COLOR, 1)
        predictions.append([
            img_path.name, cls_id, conf, x1, y1, x2, y2
        ])

    cv2.imwrite(str(Path(OUTPUT_DIR) / img_path.name), img)

# 5) CSV 저장
csv_path = Path(OUTPUT_DIR) / 'predictions.csv'
with open(csv_path, 'w', newline='') as f:
    writer = csv.writer(f)
    writer.writerow(['image','class_id','confidence','x1','y1','x2','y2'])
    writer.writerows(predictions)

print(f"\n✔ Predictions saved to '{csv_path}'")
print(f"✔ Visualizations saved to '{OUTPUT_DIR}'")

# —————————————— 테스트셋 평가 지표 출력 ——————————————
print("\n=== TEST SET EVALUATION ===")
results = model.val(
    data=DATA_YAML,
    split='test',
    imgsz=IMG_SIZE,
    conf=0.0,
    iou=1.0,
    device=device,
    verbose=False
)

# 전체 지표
P, R, mAP50, mAP5095 = (
    results.metrics.precision,
    results.metrics.recall,
    results.metrics.map50,
    results.metrics.map5095
)
print(f"Precision (all)   : {P*100:5.2f}%")
print(f"Recall    (all)   : {R*100:5.2f}%")
print(f"mAP50     (all)   : {mAP50*100:5.2f}%")
print(f"mAP50–95  (all)   : {mAP5095*100:5.2f}%")

# 클래스별 mAP50
print("\n--- Class-wise mAP50 ---")
for idx, ap in zip(results.ap_class_index, results.maps):
    name = results.names[int(idx)]
    print(f"{idx:02d} {name:20s}: {ap*100:5.2f}%")

