import os
import json
import cv2
import numpy as np
from PIL import Image, ImageOps
from pathlib import Path
from ultralytics import YOLO
import torch
import sys

# ───── 모델 경로 및 가이드 경로 설정 ─────
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))  # 현재 파일 경로 기준
STAIN_MODEL_PATH = os.path.join(BASE_DIR, "stain", "stain_cls.pt")
LABEL_MODEL_PATH = os.path.join(BASE_DIR, "symbol", "laundry_labels_cls.pt")
STAIN_GUIDE_PATH = os.path.join(BASE_DIR, "stain", "stain_washing_guidelines.json")
LABEL_GUIDE_PATH = os.path.join(BASE_DIR, "symbol", "label_symbol_guide.json")
#BASE_DIR = "."
#STAIN_MODEL_PATH = f"{BASE_DIR}/stain/stain_cls.pt"
#LABEL_MODEL_PATH = f"{BASE_DIR}/symbol/laundry_labels_cls.pt"
#STAIN_GUIDE_PATH = f"{BASE_DIR}/stain/stain_washing_guidelines.json"
#LABEL_GUIDE_PATH = f"{BASE_DIR}/symbol/label_symbol_guide.json"

# ───── 클래스 정의 및 threshold 설정 ─────
STAIN_CLASSES = [
    "blood",
    "coffee",
    "earth",
    "ink",
    "kimchi",
    "lipstick",
    "mustard",
    "oil",
    "wine",
]
CLASS_CONF_TH = {
    "blood": 0.260,
    "coffee": 0.350,
    "earth": 0.230,
    "ink": 0.190,
    "kimchi": 0.500,
    "lipstick": 0.330,
    "mustard": 0.160,
    "oil": 0.360,
    "wine": 0.100,
}
GLOBAL_CONF = min(CLASS_CONF_TH.values())

LABEL_CONF = 0.3
TOP_K = 3

# ───── 모델 로드 ─────
stain_model = YOLO(STAIN_MODEL_PATH)
label_model = YOLO(LABEL_MODEL_PATH)

# ───── 세탁 가이드 로딩 ─────
with open(STAIN_GUIDE_PATH, "r", encoding="utf-8") as f:
    stain_guide = json.load(f)
with open(LABEL_GUIDE_PATH, "r", encoding="utf-8") as f:
    label_guide = json.load(f)


# ───── 이미지 정사각형 패딩 후 리사이즈 ─────
def crop_pad_resize(pil_img, size=320):
    w, h = pil_img.size
    m = max(w, h)
    pad = ((m - w) // 2, (m - h) // 2, m - w - (m - w) // 2, m - h - (m - h) // 2)
    return ImageOps.expand(pil_img, pad, fill=(0, 0, 0)).resize((size, size))


# ───── 얼룩 예측 및 시각화 ─────
def predict_stain(image_path, save_dir="output/stain"):
    os.makedirs(save_dir, exist_ok=True)
    result = stain_model(image_path, conf=GLOBAL_CONF)[0]

    if len(result.boxes.cls) == 0:
        return []

    classes = result.boxes.cls.cpu().numpy().astype(int)
    probs = result.boxes.conf.cpu().numpy()
    boxes = result.boxes.xyxy.cpu().numpy()

    keep = np.array(
        [probs[i] >= CLASS_CONF_TH[STAIN_CLASSES[cls]] for i, cls in enumerate(classes)]
    )
    classes, probs, boxes = classes[keep], probs[keep], boxes[keep]
    if len(classes) == 0:
        return []

    sorted_idx = probs.argsort()[::-1]
    top3 = [
        (STAIN_CLASSES[classes[i]], round(float(probs[i]), 3))
        for i in sorted_idx[:TOP_K]
    ]

    img_np = cv2.imread(image_path)
    img_np = cv2.cvtColor(img_np, cv2.COLOR_BGR2RGB)

    for i in range(len(classes)):
        x1, y1, x2, y2 = map(int, boxes[i])
        cls_id = classes[i]
        label = f"{STAIN_CLASSES[cls_id]} {probs[i]:.2f}"
        cv2.rectangle(img_np, (x1, y1), (x2, y2), (0, 0, 255), 2)
        cv2.putText(
            img_np, label, (x1, y1 - 5), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 255), 2
        )

    save_path = os.path.join(save_dir, Path(image_path).stem + "_stain.jpg")
    cv2.imwrite(save_path, cv2.cvtColor(img_np, cv2.COLOR_RGB2BGR))
    return top3


# ───── 라벨 예측 및 시각화 ─────
def predict_label(image_path, save_dir="output/label"):
    os.makedirs(save_dir, exist_ok=True)
    result = label_model.predict(
        source=image_path,
        imgsz=640,
        conf=LABEL_CONF,
        iou=0.35,
        max_det=1000,
        agnostic_nms=True,
        augment=True,
        device="cuda" if torch.cuda.is_available() else "cpu",
        verbose=False,
    )[0]

    img = cv2.imread(image_path)
    if result.boxes is None or len(result.boxes) == 0:
        return []

    names_detected = []
    for box, cls_id, conf in zip(
        result.boxes.xyxy, result.boxes.cls, result.boxes.conf
    ):
        x1, y1, x2, y2 = map(int, box.cpu().numpy())
        cls_id = int(cls_id)
        class_name = label_model.names[cls_id]
        label = f"{class_name} {conf:.2f}"
        names_detected.append(class_name)
        cv2.rectangle(img, (x1, y1), (x2, y2), (0, 255, 0), 2)
        cv2.putText(
            img,
            class_name,
            (x1, y1 - 20),
            cv2.FONT_HERSHEY_SIMPLEX,
            2.0,
            (0, 255, 0),
            4,
        )  # 글자 크게 표시

    save_path = os.path.join(save_dir, Path(image_path).stem + "_label.jpg")
    cv2.imwrite(save_path, img)
    return list(set(names_detected))


# ───── 메인 함수: 인자 기반 분석 실행 ─────
def main():
    if len(sys.argv) < 3:
        print("사용법: python laundry_pipeline.py <analysis_type> <image_path>")
        print("analysis_type: stain_only | label_only")
        sys.exit(1)

    analysis_type = sys.argv[1]
    image_path = sys.argv[2]

    if analysis_type == "stain_only":
        top3 = predict_stain(image_path)
        output = {
            "detected_stain": {
                "top3": [{"class": c, "confidence": s} for c, s in top3]
            },
            "washing_instructions": [],
        }
        seen = set()
        for stain, _ in top3:
            if stain not in seen:
                output["washing_instructions"].append(
                    {"class": stain, "instruction": stain_guide.get(stain, "정보 없음")}
                )
                seen.add(stain)
        print(json.dumps(output, ensure_ascii=False, indent=2))

    elif analysis_type == "label_only":
        labels = predict_label(image_path)
        output = {
            "detected_labels": labels,
            "label_explanation": [label_guide.get(lbl, "정보 없음") for lbl in labels],
        }
        print(json.dumps(output, ensure_ascii=False, indent=2))

    else:
        print("⚠️ analysis_type은 'stain_only' 또는 'label_only' 중 하나여야 합니다.")


if __name__ == "__main__":
    main()
