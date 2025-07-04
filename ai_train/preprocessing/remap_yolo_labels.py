# remap_yolo_labels_flexible.py
import argparse, json, yaml, os, shutil
from pathlib import Path
from tqdm import tqdm

IMG_EXT = {".jpg", ".jpeg", ".png", ".bmp", ".webp"}

def load_master(master_yaml: Path):
    with master_yaml.open(encoding="utf-8") as f:
        names = yaml.safe_load(f)["names"]
    return {n: i for i, n in enumerate(names)}

def try_subdir(root: Path, split: str, sub: str):
    """root/train/images → Path or None"""
    p = root / split / sub
    return p if p.exists() else None

def main(src_root, dst_root, map_json, master_yaml, hardlink=False):
    src = Path(src_root)
    dst = Path(dst_root)
    dst.mkdir(parents=True, exist_ok=True)

    # --- 사전 로드
    master2idx = load_master(Path(master_yaml))
    mapping = json.load(open(map_json, encoding="utf-8"))         # old → {master_name, master_id}

    # 원본 data.yaml이 없어도 되도록 names 리스트를 map_json에서 역추적
    id2old = list(mapping.keys())                                 # old_id → old_name (가정)

    # --- 새 data.yaml 작성
    yaml.safe_dump({
        "path": str(dst.resolve()),
        "train": "train/images",
        "val":   "val/images",
        "test":  "test/images",
        "nc": len(master2idx),
        "names": list(master2idx.keys())
    }, open(dst/"data.yaml", "w", encoding="utf-8"), allow_unicode=True)

    # --- 존재하는 split만 순회
    for split in ["train", "val", "test"]:
        img_src = try_subdir(src, split, "images")
        lbl_src = try_subdir(src, split, "labels")
        if not img_src:                 # 이 split은 없다는 뜻
            continue

        # 대상 폴더 생성
        (dst/split/"images").mkdir(parents=True, exist_ok=True)
        (dst/split/"labels").mkdir(parents=True, exist_ok=True)

        for img_path in tqdm(img_src.iterdir(), desc=f"{split}"):
            if img_path.suffix.lower() not in IMG_EXT:
                continue

            # 1) 이미지 복사/링크
            target_img = dst/split/"images"/img_path.name
            if hardlink:
                os.link(img_path, target_img)
            else:
                shutil.copy2(img_path, target_img)

            # 2) 라벨 변환
            if lbl_src:
                label_txt = lbl_src/(img_path.stem + ".txt")
                if label_txt.exists():
                    new_lines = []
                    for ln in label_txt.read_text().splitlines():
                        old_id, *rest = ln.split()
                        old_name   = id2old[int(old_id)]
                        master_id  = mapping[old_name]["master_id"]
                        new_lines.append(" ".join([str(master_id)] + rest))
                    (dst/split/"labels"/label_txt.name).write_text("\n".join(new_lines))

if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--src_root", required=True)
    ap.add_argument("--dst_root", required=True)
    ap.add_argument("--map_json", required=True)
    ap.add_argument("--master_yaml", required=True)
    ap.add_argument("--hardlink", action="store_true")
    main(**vars(ap.parse_args()))
