import os
import cv2
import numpy as np

def crop_pad_resize(image, target_size=640):
    h, w, _ = image.shape

    # 중심 기준으로 정사각형 crop
    side = min(h, w)
    center_x, center_y = w // 2, h // 2
    x1 = max(center_x - side // 2, 0)
    y1 = max(center_y - side // 2, 0)
    x2 = x1 + side
    y2 = y1 + side
    cropped = image[y1:y2, x1:x2]

    # 정사각형으로 resize
    resized = cv2.resize(cropped, (target_size, target_size))
    return resized

# ✅ 전체 폴더 경로들
base_path = "/home/t25119/aiLab/data/stain"
split_list = ["train", "val", "test"]
target_size = 640

for split in split_list:
    input_dir = os.path.join(base_path, split, "images")
    output_dir = os.path.join(base_path + "_preprocessed", split, "images")
    os.makedirs(output_dir, exist_ok=True)

    image_files = [f for f in os.listdir(input_dir) if f.lower().endswith((".jpg", ".jpeg", ".png"))]

    for fname in image_files:
        img_path = os.path.join(input_dir, fname)
        image = cv2.imread(img_path)

        if image is None:
            print(f"[경고] 이미지 로딩 실패: {img_path}")
            continue

        processed = crop_pad_resize(image, target_size=target_size)

        save_path = os.path.join(output_dir, fname)
        cv2.imwrite(save_path, processed)
