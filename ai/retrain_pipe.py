#!/usr/bin/env python3
"""
This script fetches images from the MySQL database, filters them by estimation=1, matches label .txt files,
copies them into the YOLO-style train folders for stain and symbol, and then retrains both models.
Each retraining run is saved under ai/model/stain/<run_number> and ai/model/symbol/<run_number>,
where <run_number> increments automatically for each new run.
"""
import os
import shutil
import mysql.connector
from mysql.connector import Error
from ultralytics import YOLO

# ---------------- Database Configuration ---------------- #
DB_CONFIG = {
    'host': 'localhost',
    'port': 3306,
    'user': 'your_db_user',
    'password': 'your_db_password',
    'database': 'db25119',
}

# ---------------- Source Directories ---------------- #
STAIN_IMAGE_DIR     = 'v109.src/images/output/stain/images'
STAIN_LABEL_DIR     = 'v109.src/images/output/stain/labels'
SYMBOL_IMAGE_DIR    = 'v109.src/images/output/symbol/images'
SYMBOL_LABEL_DIR    = 'v109.src/images/output/symbol/labels'

# ---------------- YOLO Data Directories ---------------- #
TRAIN_STAIN_IMG_DIR    = 'v109.src/ai/data/stain/train/images'
TRAIN_STAIN_LABEL_DIR  = 'v109.src/ai/data/stain/train/labels'
TRAIN_SYMBOL_IMG_DIR   = 'v109.src/ai/data/symbol/train/images'
TRAIN_SYMBOL_LABEL_DIR = 'v109.src/ai/data/symbol/train/labels'

# ---------------- Model Output Base Directories ---------------- #
MODEL_BASE_DIR_STAIN  = 'v109.src/ai/model/stain'
MODEL_BASE_DIR_SYMBOL = 'v109.src/ai/model/symbol'

# ---------------- Data YAML Paths ---------------- #
STAIN_DATA_YAML = 'v109.src/ai/data/stain/data.yaml'
SYMBOL_DATA_YAML = 'v109.src/ai/data/symbol/data.yaml'

# ---------------- Training Hyperparameters ---------------- #
# Stain (YOLOv8s) optimized parameters
STAIN_TRAIN_CFG = {
    'data': STAIN_DATA_YAML,
    'epochs': 500,
    'patience': 150,
    'batch': 2,
    'imgsz': 1600,
    'device': 'cuda:0',
    'workers': 1,
    'optimizer': 'auto',
    'amp': True,
    'cos_lr': False,
    'mosaic': 1.0,
    'mixup': 0.0,
    'auto_augment': 'randaugment',
    'erasing': 0.4
}
# Symbol (YOLOv8m) optimized parameters
SYMBOL_TRAIN_CFG = {
    'data': SYMBOL_DATA_YAML,
    'epochs': 100,
    'patience': 5,
    'batch': 2,
    'imgsz': 2048,
    'device': 'cuda:0',
    'workers': 4,
    'optimizer': 'SGD',
    'amp': True,
    'cos_lr': True,
    'augment': True,
    'mosaic': True,
    'mixup': 0.3
}

# Ensure all necessary directories exist
def ensure_dirs(dirs):
    for d in dirs:
        os.makedirs(d, exist_ok=True)

ensure_dirs([
    TRAIN_STAIN_IMG_DIR, TRAIN_STAIN_LABEL_DIR,
    TRAIN_SYMBOL_IMG_DIR, TRAIN_SYMBOL_LABEL_DIR,
    MODEL_BASE_DIR_STAIN, MODEL_BASE_DIR_SYMBOL
])

# ---------------- SQL Query ---------------- #
SQL_QUERY = (
    "SELECT stain_image_url, label_image_url "
    "FROM washing_history "
    "WHERE estimation = 1 "
    "  AND (stain_image_url IS NOT NULL OR label_image_url IS NOT NULL);"
)

# ---------------- Data Preparation ---------------- #
def copy_pair(image_url, img_src_dir, lbl_src_dir, img_dst_dir, lbl_dst_dir):
    if not image_url:
        return False
    img_name = os.path.basename(image_url)
    base, _ = os.path.splitext(img_name)
    src_img = os.path.join(img_src_dir, img_name)
    src_lbl = os.path.join(lbl_src_dir, f"{base}.txt")
    if os.path.exists(src_img) and os.path.exists(src_lbl):
        shutil.copy2(src_img, os.path.join(img_dst_dir, img_name))
        shutil.copy2(src_lbl, os.path.join(lbl_dst_dir, f"{base}.txt"))
        return True
    return False


def fetch_and_prepare():
    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        cursor = conn.cursor()
        cursor.execute(SQL_QUERY)
        rows = cursor.fetchall()
        for stain_url, label_url in rows:
            if copy_pair(stain_url, STAIN_IMAGE_DIR, STAIN_LABEL_DIR,
                         TRAIN_STAIN_IMG_DIR, TRAIN_STAIN_LABEL_DIR):
                print(f"[Stain] Copied {os.path.basename(stain_url)}")
            if copy_pair(label_url, SYMBOL_IMAGE_DIR, SYMBOL_LABEL_DIR,
                         TRAIN_SYMBOL_IMG_DIR, TRAIN_SYMBOL_LABEL_DIR):
                print(f"[Symbol] Copied {os.path.basename(label_url)}")
    except Error as e:
        print(f"Error connecting to DB: {e}")
    finally:
        if 'conn' in locals() and conn.is_connected():
            cursor.close()
            conn.close()

# ---------------- Utility for Run Naming ---------------- #
def get_next_run_name(base_dir):
    existing = [d for d in os.listdir(base_dir) if os.path.isdir(os.path.join(base_dir, d))]
    nums = [int(d) for d in existing if d.isdigit()]
    return str(max(nums) + 1) if nums else '1'

# ---------------- Model Retraining ---------------- #
def retrain_models():
    # Retrain Stain Classification
    stain_run = get_next_run_name(MODEL_BASE_DIR_STAIN)
    stain_model = YOLO('v109.src/ai/stain/stain_cls.pt')
    stain_model.train(
        project=MODEL_BASE_DIR_STAIN,
        name=stain_run,
        save=True,
        **STAIN_TRAIN_CFG
    )
    stain_best = os.path.join(MODEL_BASE_DIR_STAIN, stain_run, 'weights', 'best.pt')
    print(f"[Stain] Model saved to {stain_best}")

    # Retrain Symbol Classification
    symbol_run = get_next_run_name(MODEL_BASE_DIR_SYMBOL)
    symbol_model = YOLO('v109.src/ai/symbol/laundry_labels_cls.pt')
    symbol_model.train(
        project=MODEL_BASE_DIR_SYMBOL,
        name=symbol_run,
        save=True,
        **SYMBOL_TRAIN_CFG
    )
    symbol_best = os.path.join(MODEL_BASE_DIR_SYMBOL, symbol_run, 'weights', 'best.pt')
    print(f"[Symbol] Model saved to {symbol_best}")

# ---------------- Main ---------------- #
if __name__ == '__main__':
    print("Starting data preparation...")
    fetch_and_prepare()
    print("Starting model retraining...")
    retrain_models()
    print("All done.")
