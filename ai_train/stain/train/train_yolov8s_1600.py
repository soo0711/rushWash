from ultralytics import YOLO
import torch

# ✅ 디바이스 설정
device = 'cuda:0' if torch.cuda.is_available() else 'cpu'

# ✅ YOLOv8s 모델 불러오기 (사전학습된 모델에서 시작)
model = YOLO("yolov8s.pt")

# ✅ 학습 시작
model.train(
    data="/home/t25119/aiLab/data/stain/data.yaml",   # 전체 stain 클래스 yaml
    epochs=500,
    imgsz=1600,                 # 고해상도 (작은 얼룩 대응)
    batch=2,                    # ✅ GPU 메모리 절약
    device=device,
    name="stain_yolov8s_1600_a1",  # 실험 이름
    project="/home/t25119/aiLab/exp/stain/opt_final_trial",
    pretrained=True,
    resume=False,
    save=True,
    val=True,
    patience=150,
    workers=1,                  # ✅ 시스템 안정성 확보
    amp=True,                   # ✅ mixed precision (메모리 아낌)
    cache=False,                # ✅ 메모리 절약 (이미지 미리 안 올림)

    # 하이퍼파라미터
    lr0=0.001,
    lrf=0.01,
    weight_decay=0.0002,
    label_smoothing=0.01,
    warmup_epochs=2,

    # 얼룩 특화 증강
    scale=0.6,
    translate=0.2,
    shear=4.0,
    perspective=0.001,
    flipud=0.2,
    fliplr=0.5,
    hsv_h=0.015,
    hsv_s=0.7,
    hsv_v=0.4,
    erasing=0.4
)

# ✅ 학습 종료 후 메모리 정리
del model
torch.cuda.empty_cache()
print("🧼 전체 얼룩용 YOLOv8s (1280, batch=2) 학습 완료!")
