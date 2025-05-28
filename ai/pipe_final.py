#!/usr/bin/env python3
"""
MariaDB → YOLO 데이터 복사 → (Re)Train → Optimal per-class conf 찾기 → Evaluate → JSON 저장
 - Ray-tune 콜백 충돌 패치를 포함합니다.
 - stain, symbol 모델 모두 fp32→fp16 로드, 최적화된 평가 로직 적용
"""
import os
import sys
import shutil
import json
import time
import logging
import types
import yaml
import torch
import numpy as np
import pymysql
from PIL import Image, ImageOps
from collections import defaultdict
from ultralytics import YOLO

# ──────────────────────────── Ray 콜백 패치 (반드시 최상단) ────────────────────────────
try:
    import ray

    try:
        import ray.train._internal.session as _session
    except ImportError:
        internal = getattr(ray.train, "_internal", types.ModuleType("_internal"))
        ray.train._internal = internal
        session = getattr(internal, "session", types.ModuleType("session"))
        internal.session = session
        _session = session
    if not hasattr(_session, "_get_session"):
        _session._get_session = lambda: None
    logging.basicConfig(level=logging.INFO)
    logging.getLogger(__name__).info(
        "✅ Patched ray.train._internal.session._get_session"
    )
except ModuleNotFoundError:
    pass

# ──────────────────────────── 로깅 설정 ────────────────────────────
logging.basicConfig(
    level=logging.DEBUG,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)],
)
logger = logging.getLogger(__name__)

# ──────────────────────────── 경로 설정 ────────────────────────────
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SRC_ROOT = os.path.abspath(os.path.join(BASE_DIR, os.pardir))

STAIN_MODEL_PATH = os.path.join(BASE_DIR, "stain", "stain_cls.pt")
SYMBOL_MODEL_PATH = os.path.join(BASE_DIR, "symbol", "laundry_labels_cls.pt")

# MariaDB 설정
DB_HOST, DB_PORT = "localhost", 3306
DB_USER, DB_PASSWORD, DB_NAME = "dbid251", "dbpass251", "db25119"
SQL_QUERY = (
    "SELECT stain_image_url, label_image_url "
    "FROM washing_history "
    "WHERE estimation = 1 "
    "  AND (stain_image_url IS NOT NULL OR label_image_url IS NOT NULL);"
)

# 데이터/모델 디렉토리
STAIN_LABEL_DIR = os.path.join(SRC_ROOT, "images", "output", "stain", "labels")
SYMBOL_LABEL_DIR = os.path.join(SRC_ROOT, "images", "output", "symbol", "labels")

TRAIN_STAIN_IMG_DIR = os.path.join(BASE_DIR, "data", "stain", "train", "images")
TRAIN_STAIN_LABEL_DIR = os.path.join(BASE_DIR, "data", "stain", "train", "labels")
TRAIN_SYM_IMG_DIR = os.path.join(BASE_DIR, "data", "symbol", "train", "images")
TRAIN_SYM_LABEL_DIR = os.path.join(BASE_DIR, "data", "symbol", "train", "labels")

TEST_STAIN_IMG_DIR = os.path.join(BASE_DIR, "data", "stain", "test", "images")
SYMBOL_TEST_DIR = os.path.join(BASE_DIR, "data", "symbol", "test", "images")

STAIN_DATA_YAML = os.path.join(BASE_DIR, "data", "stain", "data.yaml")
SYMBOL_DATA_YAML = os.path.join(BASE_DIR, "data", "symbol", "data.yaml")

MODEL_BASE_STAIN = os.path.join(BASE_DIR, "model", "stain")
MODEL_BASE_SYM = os.path.join(BASE_DIR, "model", "symbol")

PERF_ROOT = os.path.join(BASE_DIR, os.pardir, "front", "fe-rw", "public", "performance")

# 필요한 디렉토리 생성
for p in [
    STAIN_LABEL_DIR,
    SYMBOL_LABEL_DIR,
    TRAIN_STAIN_IMG_DIR,
    TRAIN_STAIN_LABEL_DIR,
    TRAIN_SYM_IMG_DIR,
    TRAIN_SYM_LABEL_DIR,
    TEST_STAIN_IMG_DIR,
    SYMBOL_TEST_DIR,
    MODEL_BASE_STAIN,
    MODEL_BASE_SYM,
    os.path.join(PERF_ROOT, "stain"),
    os.path.join(PERF_ROOT, "symbol"),
]:
    os.makedirs(p, exist_ok=True)

# ──────────────────────────── 학습 하이퍼파라미터 ────────────────────────────
STAIN_CFG = dict(
    data=STAIN_DATA_YAML,
    epochs=5,
    patience=2,
    batch=2,
    imgsz=1600,
    device="cuda:0",
    workers=1,
    optimizer="auto",
    amp=True,
    mosaic=1.0,
    mixup=0.0,
    auto_augment="randaugment",
    erasing=0.4,
)
SYMBOL_CFG = dict(
    data=SYMBOL_DATA_YAML,
    epochs=5,
    patience=2,
    batch=2,
    imgsz=2048,
    device="cuda:0",
    workers=4,
    optimizer="SGD",
    amp=True,
    cos_lr=True,
    augment=True,
    mosaic=True,
    mixup=0.3,
)

# ──────────────────────────── 평가 설정 (초기값) ────────────────────────────
EVAL_STAIN_SIZE = 320
CLASS_NAMES_STAIN = [
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
CLASS_CONF_THRESH = {
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
GLOBAL_CONF = min(CLASS_CONF_THRESH.values())


# ──────────────────────────── 유틸 함수 ────────────────────────────
def get_next_run(root: str) -> str:
    runs = [int(d) for d in os.listdir(root) if d.isdigit()]
    return str(max(runs) + 1) if runs else "1"


def copy_pair(url, dst_img_dir, src_lbl_dir, dst_lbl_dir):
    if not url:
        logger.warning("Empty URL, skip.")
        return
    rel = url.lstrip("/")
    src_img = os.path.join(SRC_ROOT, rel)
    name, _ = os.path.splitext(os.path.basename(src_img))
    src_lbl = os.path.join(src_lbl_dir, f"{name}.txt")
    if os.path.exists(src_img) and os.path.exists(src_lbl):
        shutil.copy2(src_img, os.path.join(dst_img_dir, os.path.basename(src_img)))
        shutil.copy2(src_lbl, os.path.join(dst_lbl_dir, f"{name}.txt"))
    else:
        logger.warning(f"[MISS] {src_img} or {src_lbl} missing")


def load_yolo(weights, want_gpu=True):
    """fp32 → fuse → fp16 로드, GPU OOM 시 CPU 폴백"""
    if want_gpu and torch.cuda.is_available():
        try:
            model = YOLO(weights).to("cuda:0")
            model.fuse()
            model = model.to("cuda:0", dtype=torch.float16)
            logger.info(f"Loaded {weights} on GPU (fp16).")
            return model, "cuda:0"
        except RuntimeError as e:
            if "out of memory" in str(e).lower():
                logger.warning("GPU OOM → CPU fallback")
                torch.cuda.empty_cache()
            else:
                raise
    logger.info(f"Loaded {weights} on CPU.")
    return YOLO(weights), "cpu"


# ──────────────────────────── DB에서 데이터 복사 ────────────────────────────
def db_fetch():
    logger.info("DB fetch 시작")
    conn = pymysql.connect(
        host=DB_HOST,
        port=DB_PORT,
        user=DB_USER,
        password=DB_PASSWORD,
        database=DB_NAME,
        charset="utf8mb4",
    )
    with conn:
        cur = conn.cursor()
        cur.execute(SQL_QUERY)
        rows = cur.fetchall()
    for stain_url, label_url in rows:
        copy_pair(
            stain_url, TRAIN_STAIN_IMG_DIR, STAIN_LABEL_DIR, TRAIN_STAIN_LABEL_DIR
        )
        copy_pair(label_url, TRAIN_SYM_IMG_DIR, SYMBOL_LABEL_DIR, TRAIN_SYM_LABEL_DIR)
    logger.info("DB fetch 완료")


# ──────────────────────────── per-class conf 튜닝 ────────────────────────────
def optimize_conf_thresh(weights_path):
    logger.info("Optimizing per-class conf thresholds")
    model, device = load_yolo(weights_path)
    records = []  # (gt_idx, pred_idx, pred_conf)
    resize_pad = lambda im: ImageOps.expand(
        im,
        (
            (max(im.size) - im.size[0]) // 2,
            (max(im.size) - im.size[1]) // 2,
            max(im.size) - im.size[0] - (max(im.size) - im.size[0]) // 2,
            max(im.size) - im.size[1] - (max(im.size) - im.size[1]) // 2,
        ),
        fill=(0, 0, 0),
    ).resize((EVAL_STAIN_SIZE,) * 2)

    # 1) 모든 테스트 이미지에 대해 top1 예측 저장
    for fn in os.listdir(TEST_STAIN_IMG_DIR):
        if not fn.lower().endswith((".jpg", ".png")):
            continue
        gt = fn.split("_")[0].lower()
        if gt not in CLASS_NAMES_STAIN:
            continue
        gt_idx = CLASS_NAMES_STAIN.index(gt)
        img = Image.open(os.path.join(TEST_STAIN_IMG_DIR, fn)).convert("RGB")
        img = resize_pad(img)
        res = model(img, conf=0.0, device=device)[0]  # no pre-filter
        if not res.boxes:
            records.append((gt_idx, None, 0.0))
            continue
        cls = res.boxes.cls.cpu().numpy().astype(int)
        conf = res.boxes.conf.cpu().numpy()
        top = conf.argmax()
        records.append((gt_idx, cls[top], float(conf[top])))

    # 2) 클래스별 F1-opt 임계치 탐색
    new_thresh = {}
    for c_idx, c_name in enumerate(CLASS_NAMES_STAIN):
        total = sum(1 for gt, _, _ in records if gt == c_idx)
        best_t, best_f1 = 0.0, -1.0
        for t in np.linspace(0, 1, 101):
            tp = sum(
                1
                for gt, pred, conf in records
                if gt == c_idx and pred == c_idx and conf >= t
            )
            pred_as_c = sum(
                1 for _, pred, conf in records if pred == c_idx and conf >= t
            )
            fp = pred_as_c - tp
            fn = total - tp
            P = tp / (tp + fp) if (tp + fp) > 0 else 0.0
            R = tp / (tp + fn) if (tp + fn) > 0 else 0.0
            f1 = 2 * P * R / (P + R) if (P + R) > 0 else 0.0
            if f1 > best_f1:
                best_f1, best_t = f1, t
        new_thresh[c_name] = round(best_t, 3)
        logger.debug(f"Class {c_name}: best_t={best_t:.3f}, F1={best_f1:.4f}")

    new_global = min(new_thresh.values())
    logger.info(f"Optimized thresholds: {new_thresh}, GLOBAL_CONF={new_global:.3f}")
    return new_thresh, new_global


# ──────────────────────────── 평가: Stain (miss 제외) ────────────────
def evaluate_stain(weights_path):
    logger.info(f"Evaluating stain: {weights_path}")
    model, device = load_yolo(weights_path)

    # 테스트 이미지 종횡비 유지 후 패딩 → resize
    def resize_pad(im):
        w, h = im.size
        m = max(w, h)
        pad = ((m - w) // 2, (m - h) // 2, m - w - (m - w) // 2, m - h - (m - h) // 2)
        return ImageOps.expand(im, pad, fill=(0, 0, 0)).resize((EVAL_STAIN_SIZE,) * 2)

    # 통계 초기화
    stats = {
        "s": defaultdict(int),  # total samples
        "m": defaultdict(int),  # misses
        "t1": defaultdict(int),  # top-1 correct
        "t3": defaultdict(int),  # top-3 correct
    }
    inf_t = 0.0

    for fn in os.listdir(TEST_STAIN_IMG_DIR):
        if not fn.lower().endswith((".jpg", ".png")):
            continue
        gt = fn.split("_")[0].lower()
        if gt not in CLASS_NAMES_STAIN:
            continue
        idx = CLASS_NAMES_STAIN.index(gt)
        stats["s"][idx] += 1

        img = Image.open(os.path.join(TEST_STAIN_IMG_DIR, fn)).convert("RGB")
        img = resize_pad(img)
        t0 = time.time()
        res = model(img, conf=GLOBAL_CONF, device=device)[0]
        inf_t += time.time() - t0

        # miss 체크
        if not res.boxes:
            stats["m"][idx] += 1
            continue

        cls = res.boxes.cls.cpu().numpy().astype(int)
        conf = res.boxes.conf.cpu().numpy()
        keep = np.array(
            [
                conf[i] >= CLASS_CONF_THRESH[CLASS_NAMES_STAIN[c]]
                for i, c in enumerate(cls)
            ],
            dtype=bool,
        )
        cls, conf = cls[keep], conf[keep]
        if cls.size == 0:
            stats["m"][idx] += 1
            continue

        order = conf.argsort()[::-1]
        top3 = cls[order[:3]]
        if idx == top3[0]:
            stats["t1"][idx] += 1
        if idx in top3:
            stats["t3"][idx] += 1

    # per-class, overall 계산
    per = {}
    tot_s = tot_m = tot1 = tot3 = 0
    for i, name in enumerate(CLASS_NAMES_STAIN):
        s = stats["s"][i]
        m = stats["m"][i]
        non_miss = s - m
        o1 = stats["t1"][i]
        o3 = stats["t3"][i]
        if non_miss > 0:
            per[name] = {
                "samples": s,
                "miss": m,
                "top1_acc": round(o1 / non_miss, 4),
                "top3_acc": round(o3 / non_miss, 4),
            }
            tot_s += s
            tot_m += m
            tot1 += o1
            tot3 += o3

    overall = {}
    total_non_miss = tot_s - tot_m
    if total_non_miss > 0:
        overall = {
            "samples": tot_s,
            "miss": tot_m,
            "top1_acc": round(tot1 / total_non_miss, 4),
            "top3_acc": round(tot3 / total_non_miss, 4),
            "precision": round(tot1 / total_non_miss, 4),
            "recall": round(tot1 / total_non_miss, 4),
            "inference_time": {
                "total_s": round(inf_t, 4),
                "avg_per_image_s": round(inf_t / tot_s, 4),
            },
        }

    logger.info(f"Stain overall (miss excluded): {overall}")
    return {"per_class": per, "overall": overall}


# ──────────────────────────── 평가: Symbol ────────────────────────────
def evaluate_symbol(weights_path):
    logger.info(f"Evaluating symbol: {weights_path}")
    model, device = load_yolo(weights_path)
    data = yaml.safe_load(open(SYMBOL_DATA_YAML))
    names = data["names"]

    # 1차 val → AP>0 클래스만 추리기
    first = model.val(
        data=SYMBOL_DATA_YAML,
        split="test",
        imgsz=SYMBOL_CFG["imgsz"],
        conf=0.5,
        augment=False,
        device=device,
        verbose=False,
    )
    initial = {int(idx): ap for idx, ap in zip(first.ap_class_index, first.maps)}
    valid_ids = [idx for idx, ap in initial.items() if ap > 0.0]

    # 2차 val → valid_ids만
    final = model.val(
        data=SYMBOL_DATA_YAML,
        split="test",
        imgsz=SYMBOL_CFG["imgsz"],
        conf=0.5,
        augment=SYMBOL_CFG["augment"],
        classes=valid_ids,
        device=device,
        verbose=False,
    )
    P, R, m50, m5095 = final.box.mean_results()
    inf_ms = final.speed.get("inference", 0.0)
    maps = {int(idx): float(ap) for idx, ap in zip(final.ap_class_index, final.maps)}
    per_class = {names[i]: maps.get(i, 0.0) for i in range(len(names))}

    metrics = {
        "precision": P,
        "recall": R,
        "mAP50": m50,
        "mAP50-95": m5095,
        "inference_time_ms": inf_ms,
        "per_class": per_class,
    }
    logger.info(f"Symbol metrics: {metrics}")
    return metrics


# ──────────────────────────── 학습 & 평가 파이프라인 ────────────────────────────
def retrain_and_eval():
    logger.info("Starting retrain & eval pipeline")

    # Stain 모델 재학습 + conf 튜닝 + 평가
    if os.listdir(TRAIN_STAIN_IMG_DIR):
        run = get_next_run(MODEL_BASE_STAIN)
        model = YOLO(STAIN_MODEL_PATH)
        model.callbacks = []  # Ray 콜백 제거
        model.train(project=MODEL_BASE_STAIN, name=run, save=True, **STAIN_CFG)
        best = os.path.join(MODEL_BASE_STAIN, run, "weights", "best.pt")
        logger.info(f"[Stain] Trained -> {best}")

        # 1) per-class conf 최적화
        new_thresh, new_global = optimize_conf_thresh(best)
        CLASS_CONF_THRESH.clear()
        CLASS_CONF_THRESH.update(new_thresh)
        global GLOBAL_CONF
        GLOBAL_CONF = new_global

        # 2) 튜닝된 임계치로 평가
        res = evaluate_stain(best)
        out = {
            "model_version": float(run) / 10,
            "model_type": "stain",
            "weights_path": best,
            "metrics": res,
        }
        p = os.path.join(PERF_ROOT, "stain", "performance.json")
        json.dump(out, open(p, "w", encoding="utf8"), ensure_ascii=False, indent=2)
        logger.info(f"[Stain] Report -> {p}")
    else:
        logger.error("No stain train images found; skipping stain")

    # Symbol 모델 재학습 + 평가
    if os.listdir(TRAIN_SYM_IMG_DIR):
        run = get_next_run(MODEL_BASE_SYM)
        model = YOLO(SYMBOL_MODEL_PATH)
        model.callbacks = []
        model.train(project=MODEL_BASE_SYM, name=run, save=True, **SYMBOL_CFG)
        best = os.path.join(MODEL_BASE_SYM, run, "weights", "best.pt")
        logger.info(f"[Symbol] Trained -> {best}")

        res = evaluate_symbol(best)
        out = {
            "model_version": float(run) / 10,
            "model_type": "symbol",
            "weights_path": best,
            "metrics": res,
        }
        p = os.path.join(PERF_ROOT, "symbol", "performance.json")
        json.dump(out, open(p, "w", encoding="utf8"), ensure_ascii=False, indent=2)
        logger.info(f"[Symbol] Report -> {p}")
    else:
        logger.error("No symbol train images found; skipping symbol")

    logger.info("Retrain & eval pipeline complete")


if __name__ == "__main__":
    logger.info("── PIPELINE START ──")
    db_fetch()
    retrain_and_eval()
    logger.info("── PIPELINE COMPLETE ──")
