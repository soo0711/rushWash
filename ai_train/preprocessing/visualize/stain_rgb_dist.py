import os
from PIL import Image
import numpy as np
import matplotlib.pyplot as plt

# ——————————————————————————————————————————————
# 설정만 바꿔주세요
DATASET_DIR = '/home/t25119/aiLab/visualization/data/stain_data_crop'   # 예: /home/t25119/aiLab/data/stain, 클래스별 폴더 아래에 images/, labels/ 폴더 존재
OUTPUT_DIR  = '/home/t25119/aiLab/visualization/output'    # 저장될 그래프 폴더
CLASSES     = ['blood','coffee','earth','ink','kimchi','lipstick','mustard','oil','wine']
# ——————————————————————————————————————————————

os.makedirs(OUTPUT_DIR, exist_ok=True)

# 크롭 영역 불러오기
# YOLO 포맷 라벨(images가름)/labels 폴더 사용

def load_crops_from_class(cls_name):
    crops = []
    img_dir = os.path.join(DATASET_DIR, cls_name, 'images')
    lbl_dir = os.path.join(DATASET_DIR, cls_name, 'labels')
    for fname in os.listdir(img_dir):
        if not fname.lower().endswith(('.png','.jpg','.jpeg')):
            continue
        img_path = os.path.join(img_dir, fname)
        lbl_path = os.path.join(lbl_dir, os.path.splitext(fname)[0] + '.txt')
        try:
            img = Image.open(img_path).convert('RGB')
        except:
            continue
        w, h = img.size
        if not os.path.exists(lbl_path):
            continue
        with open(lbl_path) as f:
            for line in f:
                parts = line.strip().split()
                if len(parts) < 5:
                    continue
                # class_id 필요한 경우 parts[0]
                _, xc, yc, bw, bh = map(float, parts)
                x1 = int((xc - bw/2) * w)
                y1 = int((yc - bh/2) * h)
                x2 = int((xc + bw/2) * w)
                y2 = int((yc + bh/2) * h)
                crop = img.crop((x1, y1, x2, y2))
                if crop.width == 0 or crop.height == 0:
                    continue
                crops.append(np.array(crop))
    return crops

# 클래스별 RGB 히스토그램

def plot_rgb_histograms(crops, cls_name):
    pixels = np.concatenate([crop.reshape(-1,3) for crop in crops], axis=0)
    colors = ('r','g','b')
    plt.figure(figsize=(6,4))
    for i, c in enumerate(colors):
        plt.hist(pixels[:,i], bins=256, color=c, alpha=0.6, label=f'{c.upper()} channel')
    plt.title(f'{cls_name} RGB Histogram (Crops)')
    plt.xlabel('Pixel intensity')
    plt.ylabel('Count')
    plt.legend()
    plt.tight_layout()
    plt.savefig(os.path.join(OUTPUT_DIR, f'{cls_name}_rgb_hist.png'))
    plt.close()

# 평균 색상 막대그래프

def plot_mean_color_bar(mean_colors, classes):
    plt.figure(figsize=(8,2))
    positions = np.arange(len(classes))
    colors = mean_colors / 255.0
    plt.bar(positions, [1]*len(classes), color=colors, edgecolor='k')
    plt.xticks(positions, classes, rotation=45, ha='right')
    plt.yticks([])
    plt.title('Class-wise Mean Color (Crops)')
    plt.tight_layout()
    plt.savefig(os.path.join(OUTPUT_DIR, 'mean_color_bar.png'))
    plt.close()

# 클래스 분포

def plot_class_distribution(counts, classes):
    plt.figure(figsize=(6,4))
    plt.bar(classes, counts, color='skyblue', edgecolor='k')
    plt.xticks(rotation=45, ha='right')
    plt.ylabel('Number of crops')
    plt.title('Crop Count per Class')
    plt.tight_layout()
    plt.savefig(os.path.join(OUTPUT_DIR, 'class_distribution.png'))
    plt.close()

# 평균 밝기 히스토그램

def plot_mean_brightness_hist(crops, cls_name):
    pixels = np.concatenate([crop.reshape(-1,3) for crop in crops], axis=0)
    brightness = pixels.mean(axis=1)
    plt.figure(figsize=(6,4))
    plt.hist(brightness, bins=256, color='gray', alpha=0.7)
    plt.title(f'{cls_name} Brightness Histogram (Crops)')
    plt.xlabel('Brightness')
    plt.ylabel('Count')
    plt.tight_layout()
    plt.savefig(os.path.join(OUTPUT_DIR, f'{cls_name}_brightness_hist.png'))
    plt.close()

# 메인 함수

def main():
    counts = []
    mean_colors = []
    for cls in CLASSES:
        print(f'Processing class: {cls}')
        crops = load_crops_from_class(cls)
        counts.append(len(crops))
        if not crops:
            continue
        plot_rgb_histograms(crops, cls)
        # 이미지별 평균 색상 계산 후 클래스 평균
        img_means = np.vstack([crop.reshape(-1,3).mean(axis=0) for crop in crops])
        class_mean = img_means.mean(axis=0)
        mean_colors.append(class_mean)
        plot_mean_brightness_hist(crops, cls)
    mean_colors = np.array(mean_colors)
    plot_class_distribution(counts, CLASSES)
    plot_mean_color_bar(mean_colors, CLASSES)

if __name__ == '__main__':
    main()
