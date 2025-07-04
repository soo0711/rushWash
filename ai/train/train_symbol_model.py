#!/usr/bin/env python3
import os
# (선택) 메모리 단편화 방지
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
    # 디바이스 설정
    device = 'cuda:0' if torch.cuda.is_available() else 'cpu'
    print(f"[Train] Using device: {device}")

    # 모델 로드: yolov8m (medium)
    model = YOLO("yolov8m.pt").to(device)

    # 학습 파라미터 최적화 설정
    train_params = {
        'data': "/home/t25119/aiLab/labels_detect_cls/data/version1/data.yaml",
        'epochs': 100,                # 충분한 에폭 증가
        'imgsz': 2048,                # 고해상도로 안정적 검출
        'batch': 4,                   # VRAM 상황에 맞춰 조정
        'device': device,
        'optimizer': 'SGD',           # 모멘텀 활성화된 SGD 사용
        'lr0': 0.01,                  # 초기 학습률
        'lrf': 0.2,                   # 최종 학습률 비율
        'momentum': 0.937,            # SGD 모멘텀
        'weight_decay': 0.0005,       # 가중치 감쇠
        'warmup_epochs': 3,           # 워밍업 에폭
        'warmup_momentum': 0.8,
        'warmup_bias_lr': 0.1,
        'augment': True,              # 데이터 증강 활성화
        'cos_lr': True,               # Cosine Annealing LR 스케줄러
        'patience': 25,               # Early stopping patience
        'project': "/home/t25119/aiLab/labels_detect_cls/model",
        'name': "label43_yolov8m_2048",
        # 추가 하이퍼파라미터 옵션
        'hsv_h': 0.015,               # HSV 색상 변형 범위
        'hsv_s': 0.7,
        'hsv_v': 0.4,
        'degrees': 5.0,               # 회전 범위
        'translate': 0.1,             # 이동 범위
        'scale': 0.5,                 # 축소/확대 범위
        'shear': 2.0,
        'flipud': 0.0,                # 수직 뒤집기 비율
        'fliplr': 0.5,                # 수평 뒤집기 비율
        'mosaic': True,               # 모자이크 증강
        'mixup': 0.3,                 # MixUp 증강 비율
        # Early stopping은 patience로 자동 적용
    }

    # 학습 실행
    model.train(**train_params)


if __name__ == "__main__":
    main()
