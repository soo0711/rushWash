#!/usr/bin/env python3
import argparse
import os
import torch
from ultralytics import YOLO

def parse_args():
    p = argparse.ArgumentParser()
    p.add_argument('--data',    type=str,   default="/home/t25119/aiLab/stain/data/data.yaml")
    p.add_argument('--model',   type=str,   default="yolov8s.pt")
    p.add_argument('--project', type=str,   default="/home/t25119/aiLab/stain/model")
    p.add_argument('--name',    type=str,   default="yolov8s_2048")
    p.add_argument('--epochs',  type=int,   default=100)
    p.add_argument('--imgsz',   type=int,   default=2048)
    p.add_argument('--batch',   type=int,   default=2)
    p.add_argument('--workers', type=int,   default=4)
    p.add_argument('--resume',  action='store_true')
    return p.parse_args()

def main():
    args = parse_args()

    # GPU 메모리 제한
    try:
        torch.cuda.set_per_process_memory_fraction(0.5, device=0)
        print("[Info] GPU memory capped at 50%")
    except Exception:
        pass
    torch.backends.cuda.matmul.allow_tf32 = True
    torch.backends.cudnn.benchmark = True

    # Ray 호환 패치 (필요할 때만)
    try:
        import ray.train._internal.session as _s
        if hasattr(_s, 'get_session') and not hasattr(_s, '_get_session'):
            _s._get_session = _s.get_session
        print("[Patch] Ray 2.x compatibility applied")
    except Exception as e:
        print(f"[Warn] Ray patch failed: {e}")

    device = 'cuda:0' if torch.cuda.is_available() else 'cpu'
    print(f"[Train] Device: {device}")

    # 모델 로드 (device 파라미터는 train()에 넘깁니다)
    model = YOLO(args.model)

    # 학습 파라미터
    train_params = {
        'data'          : args.data,
        'epochs'        : args.epochs,
        'imgsz'         : args.imgsz,
        'batch'         : args.batch,
        'device'        : device,
        'workers'       : args.workers,
        'optimizer'     : 'SGD',
        'lr0'           : 0.01,
        'lrf'           : 0.2,
        'momentum'      : 0.937,
        'weight_decay'  : 5e-4,
        'warmup_epochs' : 3,
        'warmup_momentum': 0.8,
        'warmup_bias_lr': 0.1,
        'augment'       : True,
        'mosaic'        : True,
        'mixup'         : 0.3,
        'degrees'       : 5.0,
        'translate'     : 0.1,
        'scale'         : 0.5,
        'shear'         : 2.0,
        'flipud'        : 0.0,
        'fliplr'        : 0.5,
        'patience'      : 10,
        'project'       : args.project,
        'name'          : args.name,
        'exist_ok'      : True,
        'resume'        : args.resume,
    }

    model.train(**train_params)
    print("[Train] Finished.")

if __name__ == "__main__":
    main()
