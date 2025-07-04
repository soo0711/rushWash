#!/usr/bin/env python3
import os, sys, csv
from ultralytics import YOLO
from PIL import Image, ImageOps
import torch, numpy as np
from sklearn.metrics import confusion_matrix
import matplotlib.pyplot as plt

# ──────────────────────────────────────────────────────────────
def load_yolo(weights, want_gpu=True):
    if want_gpu and torch.cuda.is_available():
        try:
            return YOLO(weights).to("cuda:0", dtype=torch.float16), "cuda:0"
        except RuntimeError as e:
            if "out of memory" in str(e):
                print("[WARN] GPU OOM → CPU 폴백", file=sys.stderr)
                torch.cuda.empty_cache()
            else:
                raise
    return YOLO(weights), "cpu"

def crop_pad_resize(img, size=320):
    w, h = img.size; m = max(w, h)
    pad = ((m-w)//2, (m-h)//2, m-w-(m-w)//2, m-h-(m-h)//2)
    return ImageOps.expand(img, pad, fill=(0,0,0)).resize((size, size))

# ──────────────────────────────────────────────────────────────
# 1. 모델 로드
model, infer_device = load_yolo("./best.pt")

# 2. 클래스 리스트 및 임계치
class_names = ["blood","coffee","earth","ink","kimchi",
               "lipstick","mustard","oil","wine"]
class_conf_th = {
    "blood":0.260,"coffee":0.350,"earth":0.230,"ink":0.190,
    "kimchi":0.500,"lipstick":0.330,"mustard":0.160,"oil":0.360,"wine":0.100,
}
global_conf = min(class_conf_th.values())

# 3. 파일 목록
image_dir = "./test/images"
images = [f for f in os.listdir(image_dir) if f.lower().endswith((".jpg",".png"))]

# 4. 로그 파일 준비
log_path = "prediction_log.csv"
with open(log_path, "w", newline="") as log_file:
    writer = csv.writer(log_file)
    writer.writerow(["image", "gt_class", "pred_class", "pred_conf"])

    # 5. 예측·정답 저장용 리스트
    y_true, y_pred = [], []

    # 6. 평가 루프
    for fname in images:
        # GT 클래스
        gt_label = fname.split("_")[0].lower()
        if gt_label not in class_names:
            continue
        gt_idx = class_names.index(gt_label)
        y_true.append(gt_idx)

        # 이미지 전처리
        img = crop_pad_resize(
            Image.open(os.path.join(image_dir, fname)).convert("RGB"), 
            size=320
        )

        # 추론
        res = model(img, conf=global_conf, device=infer_device)[0]
        if len(res.boxes):
            pred_idxs  = res.boxes.cls.cpu().numpy().astype(int)
            pred_confs = res.boxes.conf.cpu().numpy()
        else:
            pred_idxs, pred_confs = np.array([],int), np.array([])

        # 클래스별 임계치 필터링
        keep = np.array([
            conf >= class_conf_th[class_names[c]] 
            for c, conf in zip(pred_idxs, pred_confs)
        ], bool)
        pred_idxs = pred_idxs[keep]
        pred_confs = pred_confs[keep]

        # 최종 예측 결정 (Top-1)
        if len(pred_idxs):
            best_i = np.argmax(pred_confs)
            pred_idx = int(pred_idxs[best_i])
            pred_conf = float(pred_confs[best_i])
        else:
            pred_idx, pred_conf = -1, 0.0

        y_pred.append(pred_idx)

        # 로그 기록
        writer.writerow([
            fname, 
            class_names[gt_idx], 
            class_names[pred_idx] if pred_idx>=0 else "None", 
            f"{pred_conf:.3f}"
        ])

# 7. 혼동 행렬 계산 (‘no detection’ 제외)
cm = confusion_matrix(y_true, y_pred, labels=list(range(len(class_names))))

# 8. 그래프 시각화 및 저장
fig, ax = plt.subplots(figsize=(8, 6))
im = ax.imshow(cm, interpolation="nearest", cmap=plt.cm.Blues)
plt.colorbar(im, ax=ax)
ax.set(
    xticks=np.arange(len(class_names)), 
    yticks=np.arange(len(class_names)),
    xticklabels=class_names, 
    yticklabels=class_names,
    ylabel="True label", 
    xlabel="Predicted label",
    title="Confusion Matrix"
)
plt.setp(ax.get_xticklabels(), rotation=45, ha="right")
thresh = cm.max() / 2
for i in range(len(class_names)):
    for j in range(len(class_names)):
        ax.text(j, i, cm[i, j], ha="center", va="center",
                color="white" if cm[i, j] > thresh else "black")
fig.tight_layout()
plt.savefig("confusion_matrix.png", dpi=200)
plt.close(fig)

print(f"로그가 '{log_path}'에 저장되었고, 'confusion_matrix.png'가 생성되었습니다.")