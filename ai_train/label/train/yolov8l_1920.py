#!/usr/bin/env python3
import os
os.environ["PYTORCH_CUDA_ALLOC_CONF"] = "max_split_size_mb:128"

# ─── Ray 2.x 세션 이름 바인딩 패치 ─────────────────────────
try:
    import ray.train._internal.session as _internal_session
    if hasattr(_internal_session, 'get_session') and not hasattr(_internal_session, '_get_session'):
        _internal_session._get_session = _internal_session.get_session
    print("[Patch] Ray 2.x 호환성 패치 완료")
except Exception as e:
    print(f"[Warning] Ray 패치 실패 ({e}), RayTuneCallback 에러가 발생할 수 있음")
# ───────────────────────────────────────────────────────────

import torch
from ultralytics import YOLO


def main():
    device = 'cuda:0' if torch.cuda.is_available() else 'cpu'
    print(f"[Train] Using device: {device}")

    # 🔄 1) 43 클래스용 경량 모델 : yolov8s
    model = YOLO("yolov8l.pt").to(device)

    # 🔄 2) 학습 파라미터 (고해상도 + 강한 증강 + 더 많은 epoch)
    train_params = {
        'data': "/home/t25119/aiLab/labels_detect_cls/data/version3/data.yaml",
        'epochs': 150,              # s 버전은 파라미터 적으니 epoch ↑
        'imgsz': 1920,              # 고해상도로 작은 기호 살리기
        'batch': 4,                 # 메모리 여유 → 8 권장(안 되면 4로)
        'device': device,

        # Optimizer & LR schedule
        'optimizer': 'SGD',
        'lr0': 0.012,               # 모델이 작으니 약간 ↑
        'lrf': 0.2,
        'momentum': 0.937,
        'weight_decay': 0.0005,
        'warmup_epochs': 3,
        'warmup_momentum': 0.8,
        'warmup_bias_lr': 0.1,
        'cos_lr': True,

        # Early stopping
        'patience': 25,

        # 증강(Recall 확보용) 🔄
        'hsv_h': 0.015,
        'hsv_s': 0.7,
        'hsv_v': 0.4,
        'degrees': 5.0,
        'translate': 0.1,
        'scale': 0.5,
        'shear': 2.0,
        'flipud': 0.0,
        'fliplr': 0.5,
        'mosaic': True,
        'mixup': 0.3,

        # 프로젝트 폴더
        'project': "/home/t25119/aiLab/labels_detect_cls/model",
        'name': "version3_yolov8l_1920_train",
    }

    model.train(**train_params)


if __name__ == "__main__":
    main()
