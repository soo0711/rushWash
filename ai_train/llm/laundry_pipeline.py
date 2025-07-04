import os
import json
import cv2
import numpy as np
from pathlib import Path
from ultralytics import YOLO
import torch
import sys
import random

# ───── 경로 설정 ─────
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
STAIN_MODEL_PATH = os.path.join(BASE_DIR, "stain", "stain_cls.pt")
LABEL_MODEL_PATH = os.path.join(BASE_DIR, "symbol", "laundry_labels_cls.pt")
STAIN_GUIDE_PATH = os.path.join(BASE_DIR, "stain", "stain_washing_guidelines.json")
LABEL_GUIDE_PATH = os.path.join(BASE_DIR, "symbol", "label_symbol_guide.json")
OUT_DIR = "/home/t25119/tyoon/tyoon/ai/"
# ───── 클래스 및 설정 ─────
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
LABEL_CONF = 0.5
TOP_K = 3

# ───── 모델 및 가이드 로딩 ─────
stain_model = YOLO(STAIN_MODEL_PATH)
label_model = YOLO(LABEL_MODEL_PATH)
with open(STAIN_GUIDE_PATH, "r", encoding="utf-8") as f:
    stain_guide = json.load(f)
with open(LABEL_GUIDE_PATH, "r", encoding="utf-8") as f:
    label_guide = json.load(f)


# ───── stain 예측 ─────
def predict_stain(image_path):
    result = stain_model(image_path, conf=GLOBAL_CONF)[0]
    classes = result.boxes.cls.cpu().numpy().astype(int)
    probs = result.boxes.conf.cpu().numpy()
    boxes = result.boxes.xyxy.cpu().numpy()

    keep = np.array(
        [probs[i] >= CLASS_CONF_TH[STAIN_CLASSES[cls]] for i, cls in enumerate(classes)]
    )
    classes, probs, boxes = classes[keep], probs[keep], boxes[keep]
    if len(classes) == 0:
        return [], ""

    sorted_idx = probs.argsort()[::-1]
    top3 = [
        (STAIN_CLASSES[classes[i]], round(float(probs[i]), 3))
        for i in sorted_idx[:TOP_K]
    ]
    top1_idx = sorted_idx[0]

    # 시각화
    img = cv2.imread(image_path)
    h, w = img.shape[:2]
    for i in range(len(classes)):
        x1, y1, x2, y2 = map(int, boxes[i])
        cls_id = classes[i]
        label = f"{STAIN_CLASSES[cls_id]} {probs[i]:.2f}"
        cv2.rectangle(img, (x1, y1), (x2, y2), (0, 0, 255), 2)
        cv2.putText(
            img, label, (x1, y1 - 5), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 255), 2
        )

    name = Path(image_path).stem
    out_dir = os.path.join(OUT_DIR, "output", "stain")
    os.makedirs(os.path.join(out_dir, "images"), exist_ok=True)
    os.makedirs(os.path.join(out_dir, "labels"), exist_ok=True)

    image_out = os.path.join(out_dir, "images", f"{name}_stain.jpg")
    label_out = os.path.join(out_dir, "labels", f"{name}.txt")

    # Top-1 라벨 저장
    with open(label_out, "w") as f:
        i = top1_idx
        x1, y1, x2, y2 = map(int, boxes[i])
        xc = ((x1 + x2) / 2) / w
        yc = ((y1 + y2) / 2) / h
        bw = (x2 - x1) / w
        bh = (y2 - y1) / h
        f.write(f"{classes[i]} {xc:.6f} {yc:.6f} {bw:.6f} {bh:.6f}\n")

    cv2.imwrite(image_out, img)
    return top3, os.path.relpath(image_out, OUT_DIR).replace("\\", "/")


# ───── symbol 예측 ─────
def predict_label(image_path):
    result = label_model.predict(
        source=image_path,
        imgsz=1600,
        conf=LABEL_CONF,
        iou=0.35,
        max_det=1000,
        agnostic_nms=True,
        augment=True,
        device="cuda" if torch.cuda.is_available() else "cpu",
        verbose=False,
    )[0]

    boxes = result.boxes.xyxy.cpu().numpy()
    classes = result.boxes.cls.cpu().numpy().astype(int)
    probs = result.boxes.conf.cpu().numpy()

    img = cv2.imread(image_path)
    h, w = img.shape[:2]
    name = Path(image_path).stem

    out_dir = os.path.join(OUT_DIR, "output", "symbol")
    os.makedirs(os.path.join(out_dir, "images"), exist_ok=True)
    os.makedirs(os.path.join(out_dir, "labels"), exist_ok=True)

    image_out = os.path.join(out_dir, "images", f"{name}_symbol.jpg")
    label_out = os.path.join(out_dir, "labels", f"{name}.txt")

    with open(label_out, "w") as f:
        for cls_id, conf, box in zip(classes, probs, boxes):
            x1, y1, x2, y2 = map(int, box)
            class_name = label_model.names[cls_id]
            label = f"{class_name} {conf:.2f}"
            cv2.rectangle(img, (x1, y1), (x2, y2), (0, 255, 0), 2)
            cv2.putText(
                img, label, (x1, y1 - 20), cv2.FONT_HERSHEY_SIMPLEX, 2.0, (0, 255, 0), 4
            )

            xc = ((x1 + x2) / 2) / w
            yc = ((y1 + y2) / 2) / h
            bw = (x2 - x1) / w
            bh = (y2 - y1) / h
            f.write(f"{cls_id} {xc:.6f} {yc:.6f} {bw:.6f} {bh:.6f}\n")

    cv2.imwrite(image_out, img)
    label_names = list(set(label_model.names[cls] for cls in classes))
    return label_names, os.path.relpath(image_out, OUT_DIR).replace("\\", "/")


# ───── 실행 진입점 ─────
def main():
    if len(sys.argv) < 3:
        print("사용법: python laundry_pipeline.py <analysis_type> <image_path>")
        sys.exit(1)

    analysis_type = sys.argv[1]
    image_path = sys.argv[2]

    if analysis_type == "stain_only":
        top3, output_path = predict_stain(image_path)
        output = {
            "detected_stain": {
                "top3": [{"class": c, "confidence": s} for c, s in top3]
            },
            "washing_instructions": [],
            "output_image_path": output_path,
        }

        seen_classes = set()

        for stain, _ in top3:
            if stain in seen_classes:
                continue  # 중복 방지
            seen_classes.add(stain)

            methods = stain_guide.get(stain, [])
            if isinstance(methods, list) and len(methods) > 0:
                first = methods[0]
                remaining = methods[1:]
                rand = random.sample(remaining, k=min(2, len(remaining)))
                combined = [first] + rand
            else:
                combined = ["정보 없음"]

            output["washing_instructions"].append(
                {"class": stain, "instructions": combined}
            )

        print(json.dumps(output, ensure_ascii=False, indent=2))

    elif analysis_type == "label_only":
        labels, output_path = predict_label(image_path)
        output = {
            "detected_labels": labels,
            "label_explanation": [label_guide.get(lbl, "정보 없음") for lbl in labels],
            "output_image_path": output_path,
        }
        print(json.dumps(output, ensure_ascii=False, indent=2))

    else:
        print("⚠️ analysis_type은 'stain_only' 또는 'label_only' 중 하나여야 합니다.")


if __name__ == "__main__":
    main()
