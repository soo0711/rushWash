#!/usr/bin/env python3
import os
import torch
from ultralytics import YOLO

# ─── GPU 메모리 제한 & AMP 활성화 ─────────────────────────
try:
    torch.cuda.set_per_process_memory_fraction(0.5, device=0)
    print("[Info] GPU 메모리 사용 한도: 50%")
except Exception:
    pass
torch.backends.cuda.matmul.allow_tf32 = True
torch.backends.cudnn.benchmark = True

# ─── Ray 2.x 호환 패치 ─────────────────────────
try:
    import ray.train._internal.session as _internal_session
    if hasattr(_internal_session, 'get_session') and not hasattr(_internal_session, '_get_session'):
        _internal_session._get_session = _internal_session.get_session
    print("[Patch] Ray 2.x 호환성 패치 완료")
except Exception as e:
    print(f"[Warning] Ray 패치 실패 ({e})")

def main():
    device = 'cuda:0' if torch.cuda.is_available() else 'cpu'
    print(f"[Train] Using device: {device}")

    # last.pt 로 optimizer 상태, epoch 정보까지 함께 불러옵니다.
    model = YOLO("/home/t25119/aiLab/labels_detect_cls/model/pre_final_yolov8m_2048/weights/last.pt").to(device)

    train_params = {
        'data':          "/home/t25119/aiLab/labels_detect_cls/data/laundry_data_2/data.yaml",
        'epochs':        100,        # 총 학습을 마칠 epochs 수
        'imgsz':         2048,
        'batch':         2,
        'device':        device,
        'workers':       4,
        'optimizer':     'SGD',
        'lr0':           0.01,
        'lrf':           0.2,
        'momentum':      0.937,
        'weight_decay':  0.0005,
        'warmup_epochs':    3,
        'warmup_momentum':  0.8,
        'warmup_bias_lr':   0.1,
        'augment':       True,
        'cos_lr':        True,
        'patience':      5,
        'half':          True,
        'project':       "/home/t25119/aiLab/labels_detect_cls/model",
        'name':          "pre_final_yolov8m_2048",
        'exist_ok':      True,    # 같은 project/name 폴더 재사용
        'resume':        True,    # 이전 체크포인트에서 이어서 학습
        # — 이하 augmentation 하이퍼파라미터 —
        'hsv_h':     0.015,
        'hsv_s':     0.7,
        'hsv_v':     0.4,
        'degrees':   5.0,
        'translate': 0.1,
        'scale':     0.5,
        'shear':     2.0,
        'flipud':    0.0,
        'fliplr':    0.5,
        'mosaic':    True,
        'mixup':     0.3,
    }

    model.train(**train_params)

if __name__ == "__main__":
    main()
