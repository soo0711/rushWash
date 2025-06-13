import os
import torch
import random
import numpy as np
from ultralytics import YOLO

# ───── 경로 설정 ─────
DATA_YAML = "/content/drive/MyDrive/dataset_stain/data.yaml"
PROJECT_DIR = "/content/drive/MyDrive/yolov8m_stain"
PRETRAINED = os.path.join(PROJECT_DIR, "stain_yolov8s_1600_a1", "weights", "last.pt")

# ───── 재현성용 시드 고정 ─────
seed = 0
random.seed(seed)
np.random.seed(seed)
torch.manual_seed(seed)

# ───── 모델 로드 (이전 체크포인트) ─────
model = YOLO(PRETRAINED)

# ───── 학습 파라미터 ─────
train_params = dict(
    data=DATA_YAML,
    epochs=500,  # 전체 에폭 수 (이어서: 이전 훈련 포함)
    patience=15,  # 조기종료 patience
    batch=8,
    imgsz=1600,
    save=True,
    save_period=-1,
    cache=False,
    device="cuda:0",
    workers=1,
    project=PROJECT_DIR,
    name="stain_yolov8s_1600_a1",
    exist_ok=False,
    pretrained=True,
    optimizer="auto",
    verbose=True,
    seed=seed,
    deterministic=True,
    single_cls=False,
    rect=False,
    cos_lr=False,
    close_mosaic=10,
    resume=True,  # ← 이전 훈련 이어서
    amp=True,
    fraction=1.0,
    profile=False,
    freeze=None,
    multi_scale=False,
    overlap_mask=True,
    mask_ratio=4,
    dropout=0.0,
    val=True,
    split="val",
    save_json=False,
    save_hybrid=False,
    conf=None,
    iou=0.7,
    max_det=300,
    half=False,
    dnn=False,
    plots=True,
    augment=False,
    agnostic_nms=False,
    classes=None,
    retina_masks=False,
    show=False,
    save_frames=False,
    save_txt=False,
    save_conf=False,
)
