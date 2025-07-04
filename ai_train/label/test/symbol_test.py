#!/usr/bin/env python3
# test_performance_summary_detailed.py

import time
import torch
import yaml
from ultralytics import YOLO

# ——————————————————————————————————————————————
# 유저 설정 부분
MODEL_WEIGHTS = '/home/t25119/aiLab/labels_detect_cls/model/pre_final_yolov8m_2048/weights/best.pt'
DATA_YAML     = '/home/t25119/aiLab/rules/data/symbol/data.yaml'
IMG_SIZE      = 2048 #1600 # 1056
CONF_THRESH   = 0.3   # 전 클래스 공통 confidence threshold
# ——————————————————————————————————————————————

def print_table(rows, headers):
    # 컬럼 너비 계산
    col_widths = [max(len(str(x)) for x in col) for col in zip(*([headers] + rows))]
    # 헤더
    header_line = " | ".join(h.ljust(col_widths[i]) for i, h in enumerate(headers))
    sep_line    = "-+-".join("-" * col_widths[i] for i in range(len(headers)))
    print(header_line)
    print(sep_line)
    # 데이터 행
    for row in rows:
        print(" | ".join(str(row[i]).ljust(col_widths[i]) for i in range(len(row))))


def evaluate_symbol(model_path: str, data_yaml: str) -> dict:
    model = YOLO(model_path)
    with open(data_yaml) as f:
        data = yaml.safe_load(f)
    names = data['names']

    results = model.val(
        data=data_yaml,
        split='test',
        imgsz=IMG_SIZE,
        conf=CONF_THRESH,
        device='cuda:0' if torch.cuda.is_available() else 'cpu',
        verbose=False
    )

    # ── (1) 전체 메트릭 추출 ─────────────────────────
    P, R, mAP50, mAP5095 = results.box.mean_results()
    inference_time_ms = results.speed.get('inference', 0.0)

    # ── (2) 카테고리별 mAP50 ─────────────────────────
    ap_map = { idx: float(ap) for idx, ap in zip(results.ap_class_index, results.maps) }
    per_class = {
        name: ap_map.get(i, 0.0)
        for i, name in enumerate(names)
    }

    return {
        "accuracy":          mAP50,
        "precision":         P,
        "recall":            R,
        "mAP50-95":          mAP5095,
        "inference_time_ms": inference_time_ms,
        "per_class":         per_class
    }



def main():
    # 디바이스 정보
    device = 'cuda:0' if torch.cuda.is_available() else 'cpu'
    print(f"실행 디바이스: {device}\n")

    # 평가 실행
    metrics = evaluate_symbol(MODEL_WEIGHTS, DATA_YAML)

    # 전체 지표 테이블 출력
    rows = [
        ("정확도 (mAP50)", f"{metrics['accuracy']*100:6.2f}%"),
        ("정밀도 (Precision)",  f"{metrics['precision']*100:6.2f}%"),
        ("재현율 (Recall)",     f"{metrics['recall']*100:6.2f}%"),
        ("mAP50-95",           f"{metrics['mAP50-95']*100:6.2f}%"),
        ("추론 시간 (ms/img)",  f"{metrics['inference_time_ms']:.1f} ms"),
    ]
    print("=== 전체 성능 지표 ===")
    print_table(rows, ("메트릭", "값"))
    print()

    # 카테고리별 정확도 테이블 출력
    per = metrics['per_class']
    rows = [(name, f"{ap*100:6.2f}%") for name, ap in per.items()]
    print("=== 카테고리별 mAP50 (정확도) ===")
    print_table(rows, ("카테고리", "정확도"))
    print()

if __name__ == "__main__":
    main()
