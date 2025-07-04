import os
import random
import numpy as np
import pandas as pd
from PIL import Image
#from skimage.feature import hog
from sklearn.manifold import TSNE
import matplotlib.pyplot as plt

# ——————————————————————————————————————————————
# 설정
DATASET_DIR      = '/home/t25119/aiLab/visualization/data/stain_data_crop'       # 예시: /home/t25119/aiLab/data/stain/test
OUTPUT_DIR       = '/home/t25119/aiLab/visualization/output'        # 그래프 저장 경로
CLASSES          = ['blood', 'coffee', 'earth', 'ink', 'kimchi', 'lipstick', 'mustard', 'oil', 'wine']
PIXELS_PER_CLASS = 5000                     # t-SNE 샘플 픽셀 수/클래스
# ——————————————————————————————————————————————

os.makedirs(OUTPUT_DIR, exist_ok=True)

# 1) 클래스별 크롭된 얼룩 영역 불러오기
def load_crops(cls):
    crops = []
    img_dir = os.path.join(DATASET_DIR, cls, 'images')
    lbl_dir = os.path.join(DATASET_DIR, cls, 'labels')
    for fname in os.listdir(img_dir):
        if not fname.lower().endswith(('.png', '.jpg', '.jpeg')):
            continue
        img_path = os.path.join(img_dir, fname)
        lbl_path = os.path.join(lbl_dir, os.path.splitext(fname)[0] + '.txt')
        try:
            img = Image.open(img_path).convert('RGB')
        except:
            continue
        w, h = img.size
        # 레이블 파일을 읽어, bbox 단위로 크롭
        if not os.path.exists(lbl_path):
            continue
        with open(lbl_path) as f:
            for line in f:
                parts = line.strip().split()
                if len(parts) < 5:
                    continue
                # YOLO 포맷: class_id x_center y_center width height (정규화)
                _, xc, yc, bw, bh = map(float, parts)
                x1 = int((xc - bw/2) * w)
                y1 = int((yc - bh/2) * h)
                x2 = int((xc + bw/2) * w)
                y2 = int((yc + bh/2) * h)
                crop = np.array(img.crop((x1, y1, x2, y2)))
                if crop.size == 0:
                    continue
                crops.append(crop)
    return crops

# 2) 클래스별 평균 RGB 막대그래프
def plot_class_mean_rgb(mean_colors):
    x = np.arange(len(CLASSES))
    width = 0.25
    fig, ax = plt.subplots(figsize=(8, 4))
    for i, col in enumerate(['R', 'G', 'B']):
        ax.bar(x + i * width, mean_colors[:, i], width, label=col)
    ax.set_xticks(x + width)
    ax.set_xticklabels(CLASSES, rotation=45, ha='right')
    ax.set_ylabel('Mean Intensity')
    ax.set_title('Class-wise Mean RGB (Cropped Regions)')
    ax.legend()
    fig.tight_layout()
    fig.savefig(os.path.join(OUTPUT_DIR, 'class_mean_rgb.png'))
    plt.close(fig)

# 3) t-SNE 기반 RGB 분포 시각화
def plot_rgb_tsne():
    all_pixels = []
    labels = []
    for idx, cls in enumerate(CLASSES):
        crops = load_crops(cls)
        pixels = np.concatenate([crop.reshape(-1, 3) for crop in crops], axis=0)
        sel = pixels[np.random.choice(len(pixels), PIXELS_PER_CLASS, replace=False)]
        all_pixels.append(sel)
        labels += [cls] * PIXELS_PER_CLASS
    data = np.vstack(all_pixels)
    tsne = TSNE(n_components=2, random_state=0)
    proj = tsne.fit_transform(data.astype(np.float32))
    plt.figure(figsize=(6, 6))
    for cls in CLASSES:
        idxs = [i for i, l in enumerate(labels) if l == cls]
        plt.scatter(proj[idxs, 0], proj[idxs, 1], s=2, label=cls, alpha=0.6)
    plt.legend(markerscale=4, fontsize='small')
    plt.title('t-SNE on RGB Pixels (Cropped Regions)')
    plt.tight_layout()
    plt.savefig(os.path.join(OUTPUT_DIR, 'rgb_pixels_tsne.png'))
    plt.close()

# 4) 통합 피처 기반 t-SNE 시각화
def plot_integrated_tsne():
    feats = []
    labs = []
    for cls in CLASSES:
        crops = load_crops(cls)
        for crop in crops:
            h, w = crop.shape[:2]
            # 1) mean RGB
            mean_rgb = crop.reshape(-1, 3).mean(axis=0)
            # 2) HOG (grayscale placeholder)
            gray = np.dot(crop[..., :3], [0.2989, 0.5870, 0.1140])
            # hog_feat = hog(gray, pixels_per_cell=(32, 32), cells_per_block=(2, 2), feature_vector=True)
            hog_feat = np.zeros(1)
            # 3) 위치/비율 기본값(중앙, 종횡비 1)
            cx, cy, ar = 0.5, 0.5, 1.0
            feats.append(np.hstack([mean_rgb, hog_feat, cx, cy, ar]))
            labs.append(cls)
    X = np.vstack(feats).astype(np.float32)
    tsne = TSNE(n_components=2, random_state=0)
    proj = tsne.fit_transform(X)
    plt.figure(figsize=(6, 6))
    for cls in CLASSES:
        idxs = [i for i, l in enumerate(labs) if l == cls]
        plt.scatter(proj[idxs, 0], proj[idxs, 1], s=5, label=cls, alpha=0.7)
    plt.legend(markerscale=4, fontsize='small')
    plt.title('t-SNE on Integrated Features (Cropped Regions)')
    plt.tight_layout()
    plt.savefig(os.path.join(OUTPUT_DIR, 'integrated_tsne.png'))
    plt.close()


def main():
    mean_colors = []
    for cls in CLASSES:
        crops = load_crops(cls)
        if not crops:
            continue
        class_mean = np.vstack([crop.reshape(-1, 3).mean(axis=0) for crop in crops]).mean(axis=0)
        mean_colors.append(class_mean)
    mean_colors = np.array(mean_colors)

    plot_class_mean_rgb(mean_colors)
    plot_rgb_tsne()
    plot_integrated_tsne()

if __name__ == '__main__':
    main()