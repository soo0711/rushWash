import os
import json
import cv2
import numpy as np
from pathlib import Path
from ultralytics import YOLO
import torch
import sys
import random
from transformers import AutoTokenizer, AutoModelForCausalLM

# ───── 경로 설정 ─────
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
STAIN_MODEL_PATH = os.path.join(BASE_DIR, "stain", "stain_cls.pt")
LABEL_MODEL_PATH = os.path.join(BASE_DIR, "symbol", "laundry_labels_cls.pt")
STAIN_GUIDE_PATH = os.path.join(BASE_DIR, "stain", "stain_washing_guidelines.json")
LABEL_GUIDE_PATH = os.path.join(BASE_DIR, "symbol", "label_symbol_guide.json")
OUT_DIR = os.path.abspath(os.path.join(BASE_DIR, "..", "images"))

# 로컬 LLM 모델 경로 설정 (사전에 다운로드된 모델 디렉토리)
LLM_MODEL_DIR = os.path.join(BASE_DIR, "llm/kanana-nano-2.1b-base")
# LLM 모델 로딩
llm_tokenizer = AutoTokenizer.from_pretrained(LLM_MODEL_DIR, padding_side="left")
llm_tokenizer.pad_token = llm_tokenizer.eos_token

try:
    llm_model = AutoModelForCausalLM.from_pretrained(
        LLM_MODEL_DIR, torch_dtype=torch.bfloat16, trust_remote_code=True
    ).to("cuda")
except (RuntimeError, ValueError) as e:
    print("⚠️ bfloat16 미지원 → float32로 재시도")
    llm_model = AutoModelForCausalLM.from_pretrained(
        LLM_MODEL_DIR, torch_dtype=torch.float32, trust_remote_code=True
    ).to("cuda")


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


def build_llm_prompt(stain_class, stain_advices, label_expls):
    if not stain_class or not stain_advices:
        return ""

    # 얼룩 제거법 후보 정리
    stain_list_text = "\n".join(
        [f"{i+1}. {advice}" for i, advice in enumerate(stain_advices)]
    )

    # 세탁 기호 요약 설명 정리
    label_text = (
        "세탁 조건이 감지되지 않았습니다."
        if not label_expls
        else "\n" + "\n".join(f"- {e}" for e in label_expls)
    )

    # 프롬프트 템플릿
    prompt = f"""당신은 얼룩 제거 전문가입니다.

다음은 옷의 얼룩 종류와 세탁 조건에 대한 정보입니다:

▸ 얼룩 종류: {stain_class}
▸ 얼룩 제거법 후보:
{stain_list_text}
▸ 옷의 세탁 조건:
{label_text}

이 정보를 참고하여 얼룩 제거 방법을 아래 조건에 맞게 안내해 주세요:

- **가장 적절한 제거 방법 하나만 선택**하여 설명하세요. 나머지는 언급하지 마세요.
- '세탁 기호'나 '기호명' 같은 표현은 사용하지 마세요.
- 세탁 조건은 자연스럽게 문장 안에 녹여 설명하세요.  
  예: '표백 금지' → '표백제는 사용하지 마세요'  
      '회전식 건조 금지' → '자연 건조를 권장합니다'
- 인사말 없이, 친절하고 명확한 한 문단으로 작성하세요.

세탁 방법:"""
    return prompt


# ───── 모델 및 가이드 로딩 ─────
stain_model = YOLO(STAIN_MODEL_PATH)
label_model = YOLO(LABEL_MODEL_PATH)
with open(STAIN_GUIDE_PATH, "r", encoding="utf-8") as f:
    stain_guide = json.load(f)
with open(LABEL_GUIDE_PATH, "r", encoding="utf-8") as f:
    label_guide = json.load(f)


# ───── stain 예측 ─────
def predict_stain(image_path):
    result = stain_model(image_path, conf=GLOBAL_CONF, imgsz=320)[0]
    if result.boxes is None or len(result.boxes) == 0:
        return None, None

    classes = result.boxes.cls.cpu().numpy().astype(int)
    probs = result.boxes.conf.cpu().numpy()
    boxes = result.boxes.xyxy.cpu().numpy()

    keep = np.array(
        [
            probs[i] >= CLASS_CONF_TH[STAIN_CLASSES[cls]]
            for i, cls in enumerate(classes)
        ],
        dtype=bool,
    )

    if not keep.any():
        return None, None
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
    return top3, os.path.relpath(image_out, os.path.dirname(OUT_DIR)).replace("\\", "/")


# ───── symbol 예측 ─────
def predict_label(image_path):
    result = label_model.predict(
        source=image_path,
        imgsz=2048,
        conf=LABEL_CONF,
        iou=0.35,
        max_det=1000,
        agnostic_nms=True,
        augment=True,
        device="cuda" if torch.cuda.is_available() else "cpu",
        verbose=False,
    )[0]

    if result.boxes is None or len(result.boxes) == 0:
        return None, None
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
    return label_names, os.path.relpath(image_out, os.path.dirname(OUT_DIR)).replace(
        "\\", "/"
    )


# ───── 실행 진입점 ─────
def main():
    if len(sys.argv) < 3:
        print("사용법: python laundry_pipeline.py <analysis_type> <image_path>")
        sys.exit(1)

    analysis_type = sys.argv[1]
    image_path = sys.argv[2]

    if analysis_type == "stain_only":
        top3, output_path = predict_stain(image_path)
        if top3 is None:
            output = {
                "detected_stain": {
                    "top3": [{"class": "", "confidence": ""} for _ in range(3)]
                },
                "washing_instructions": [{"class": "", "instructions": ["", "", ""]}],
                "output_image_path": "",
            }
        else:
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
        if labels is None:
            output = {
                "detected_labels": [],
                "label_explanation": [],
                "output_image_path": "",
            }
        else:
            output = {
                "detected_labels": labels,
                "label_explanation": [
                    label_guide.get(lbl, "정보 없음") for lbl in labels
                ],
                "output_image_path": output_path,
            }
        print(json.dumps(output, ensure_ascii=False, indent=2))

    elif analysis_type == "stain_and_label":
        if len(sys.argv) < 4:
            print(
                "⚠️ stain_and_label 분석에는 이미지 2장(stain, label) 경로가 필요합니다."
            )
            sys.exit(1)

        stain_img = sys.argv[2]
        label_img = sys.argv[3]

        top3, stain_out = predict_stain(stain_img)
        labels, label_out = predict_label(label_img)

        if top3 is None:
            stain_class = ""
            stain_advices = []
        else:
            stain_class = top3[0][0]
            all_methods = stain_guide.get(stain_class, [])
            if isinstance(all_methods, list) and len(all_methods) > 0:
                first = all_methods[0]
                remaining = all_methods[1:]
                rand = random.sample(remaining, k=min(2, len(remaining)))
                stain_advices = [first] + rand
            else:
                stain_advices = ["정보 없음"]

        label_expls = [label_guide.get(lbl, "") for lbl in labels] if labels else []

        # DN_wash가 포함되어 있다면 고정된 멘트 출력
        # DN_wash가 포함되어 있다면 고정된 멘트 출력
        if any("세탁 금지" in expl for expl in label_expls):
            llm_output = "감지된 세탁 기호에 따라 물세탁이 불가하여 가정에서 얼룩 제거가 어려운 제품입니다. 반드시 전문 세탁소에 의뢰하시기 바랍니다."
        elif not stain_class:
            llm_output = ""
        else:
            prompt = build_llm_prompt(stain_class, stain_advices, label_expls)
            input_ids = llm_tokenizer(prompt, return_tensors="pt").to("cuda")[
                "input_ids"
            ]
            with torch.no_grad():
                output = llm_model.generate(
                    input_ids,
                    max_new_tokens=256,
                    do_sample=True,
                    temperature=0.6,
                    top_p=0.85,
                    top_k=30,
                    pad_token_id=llm_tokenizer.eos_token_id,
                )
            decoded = llm_tokenizer.decode(output[0], skip_special_tokens=True)
            llm_output = (
                decoded.split("세탁 방법:")[-1].strip()
                if "세탁 방법:" in decoded
                else decoded.strip()
            )

        output = {
            "top1_stain": stain_class,
            "washing_instructions": stain_advices,
            "detected_labels": labels if labels else [],
            "label_explanation": label_expls,
            "output_image_paths": {
                "stain": stain_out if top3 else "",
                "label": label_out if labels else "",
            },
            "llm_generated_guide": llm_output,
        }
        print(json.dumps(output, ensure_ascii=False, indent=2))

    else:
        print(
            "⚠️ analysis_type은 'stain_only', 'label_only', 또는 'stain_and_label' 중 하나여야 합니다."
        )


if __name__ == "__main__":
    main()
