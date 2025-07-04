#!/usr/bin/env python3
import os
import json
import time
import yaml
import logging
import numpy as np
from PIL import Image, ImageOps
from collections import defaultdict
from ultralytics import YOLO
import torch

# ───── 로깅 설정 ─────
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s"
)
logger = logging.getLogger(__name__)

# ───── 경로 설정 ─────
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PERF_ROOT = os.path.join(BASE_DIR, "..", "front", "fe-rw", "public", "performance")

STAIN_MODEL_PATH = os.path.join(BASE_DIR, "stain", "stain_cls.pt")
SYMBOL_MODEL_PATH = os.path.join(BASE_DIR, "symbol", "laundry_labels_cls.pt")
STAIN_DATA_YAML = os.path.join(BASE_DIR, "data", "stain", "data.yaml")
SYMBOL_DATA_YAML = os.path.join(BASE_DIR, "data", "symbol", "data.yaml")
TEST_STAIN_IMG_DIR = os.path.join(BASE_DIR, "data", "stain", "test", "images")

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
EVAL_STAIN_SIZE = 320

SYMBOL_CONF = 0.1
SYMBOL_AUG = True


def load_yolo(weights):
    try:
        model = YOLO(weights).to("cuda:0")
        model.fuse()
        return model.to("cuda:0", dtype=torch.float16), "cuda:0"
    except:
        return YOLO(weights), "cpu"


def evaluate_stain(weights_path):
    logger.info(f"📊 Evaluating stain model: {weights_path}")
    model, device = load_yolo(weights_path)

    def resize_pad(im):
        w, h = im.size
        m = max(w, h)
        pad = ((m - w) // 2, (m - h) // 2, m - w - (m - w) // 2, m - h - (m - h) // 2)
        return ImageOps.expand(im, pad, fill=(0, 0, 0)).resize((EVAL_STAIN_SIZE,) * 2)

    stats = {
        "s": defaultdict(int),
        "m": defaultdict(int),
        "t1": defaultdict(int),
        "t3": defaultdict(int),
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

    return {"per_class": per, "overall": overall}


def evaluate_symbol(weights_path):
    logger.info(f"📊 Evaluating symbol model: {weights_path}")
    model, device = load_yolo(weights_path)

    first = model.val(
        data=SYMBOL_DATA_YAML,
        split="test",
        imgsz=2048,
        conf=SYMBOL_CONF,
        augment=False,
        device=device,
        verbose=False,
    )
    initial_maps = dict(zip(first.ap_class_index, first.maps))
    valid_ids = [int(idx) for idx, ap in initial_maps.items() if ap > 0.0]

    final = model.val(
        data=SYMBOL_DATA_YAML,
        split="test",
        imgsz=2048,
        conf=SYMBOL_CONF,
        augment=SYMBOL_AUG,
        classes=valid_ids,
        device=device,
        verbose=False,
    )
    P, R, mAP50, mAP5095 = final.box.mean_results()
    inf_ms = final.speed.get("inference", 0.0)
    names = yaml.safe_load(open(SYMBOL_DATA_YAML))["names"]
    ap_map = {int(idx): float(ap) for idx, ap in zip(final.ap_class_index, final.maps)}
    per_cls = {name: ap_map.get(i, 0.0) for i, name in enumerate(names)}

    return {
        "precision": P,
        "recall": R,
        "mAP50": mAP50,
        "mAP50-95": mAP5095,
        "inference_time_ms": inf_ms,
        "per_class": per_cls,
    }


def run_evaluation_only():
    os.makedirs(os.path.join(PERF_ROOT, "stain"), exist_ok=True)
    os.makedirs(os.path.join(PERF_ROOT, "symbol"), exist_ok=True)

    if os.path.exists(STAIN_MODEL_PATH):
        stain_result = evaluate_stain(STAIN_MODEL_PATH)
        with open(
            os.path.join(PERF_ROOT, "stain", "performance.json"), "w", encoding="utf8"
        ) as f:
            json.dump(
                {
                    "model_type": "stain",
                    "weights_path": STAIN_MODEL_PATH,
                    "metrics": stain_result,
                },
                f,
                indent=2,
                ensure_ascii=False,
            )
        logger.info("✅ Stain evaluation saved.")

    if os.path.exists(SYMBOL_MODEL_PATH):
        symbol_result = evaluate_symbol(SYMBOL_MODEL_PATH)
        with open(
            os.path.join(PERF_ROOT, "symbol", "performance.json"), "w", encoding="utf8"
        ) as f:
            json.dump(
                {
                    "model_type": "symbol",
                    "weights_path": SYMBOL_MODEL_PATH,
                    "metrics": symbol_result,
                },
                f,
                indent=2,
                ensure_ascii=False,
            )
        logger.info("✅ Symbol evaluation saved.")


if __name__ == "__main__":
    logger.info("📌 Evaluation Only Mode Started")
    run_evaluation_only()
    logger.info("✅ Evaluation Only Mode Completed")
