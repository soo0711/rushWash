#!/usr/bin/env python3
import argparse
import os
import torch
from ultralytics import YOLO

def parse_args():
    p = argparse.ArgumentParser()
    p.add_argument('--data',      type=str,   default="/home/t25119/aiLab/stain/data/data.yaml")
    p.add_argument('--model',     type=str,   default="yolov8s.pt")
    p.add_argument('--project',   type=str,   default="/home/t25119/aiLab/stain/model")
    p.add_argument('--name',      type=str,   default="yolov8m_optimized")
    p.add_argument('--epochs',    type=int,   default=200, help="충분한 학습을 위해 에폭을 200으로 증가")
    p.add_argument('--imgsz',     type=int,   default=1920)
    p.add_argument('--batch',     type=int,   default=1,   help="메모리가 허용하는 한 배치 사이즈를 늘려 안정적 그래디언트")
    p.add_argument('--workers',   type=int,   default=4)
    p.add_argument('--resume',    action='store_true')
    return p.parse_args()

def main():
    args = parse_args()

    # GPU 메모리 제한
    try:
        torch.cuda.set_per_process_memory_fraction(0.6, device=0)
        print("[Info] GPU memory capped at 60%")
    except Exception:
        pass
    torch.backends.cuda.matmul.allow_tf32 = True
    torch.backends.cudnn.benchmark = True

    # Ray 호환 패치 (필요시)
    try:
        import ray.train._internal.session as _s
        if hasattr(_s, 'get_session') and not hasattr(_s, '_get_session'):
            _s._get_session = _s.get_session
        print("[Patch] Ray 2.x compatibility applied")
    except Exception as e:
        print(f"[Warn] Ray patch failed: {e}")

    device = 'cuda:0' if torch.cuda.is_available() else 'cpu'
    print(f"[Train] Device: {device}")

    model = YOLO(args.model)

    train_params = {
        # 데이터 & 학습 스케줄
        'data':           args.data,
        'epochs':         args.epochs,
        'imgsz':          args.imgsz,
        'batch':          args.batch,
        'device':         device,
        'workers':        args.workers,
        'project':        args.project,
        'name':           args.name,
        'exist_ok':       True,
        'resume':         args.resume,

        # 옵티마이저 & 러닝레이트
        'optimizer':      'AdamW',    # 가중치 제약에도 강건한 AdamW 선택
        'lr0':            1e-3,       # 초기 학습률
        'lrf':            0.2,        # cosine 감쇠 최종 LR = lr0 * lrf
        'momentum':       0.937,      # SGD 호환 모멘텀(AdamW 에도 적용)
        'weight_decay':   5e-4,       # 일반화

        # 워밍업
        'warmup_epochs':  5,          # 충분한 warmup
        'warmup_momentum':0.8,
        'warmup_bias_lr': 0.1,

        # 조기 종료
        'patience':       15,         # val loss 개선 없으면 15 에폭 후 멈춤

        # 데이터 증강 :contentReference[oaicite:0]{index=0}
        'augment':        True,
        'mosaic':         1.0,        # 항상 모자이크
        'mixup':          0.5,        # 강도 높은 mixup
        'hsv_h':          0.015,      # 색상 변화
        'hsv_s':          0.7,
        'hsv_v':          0.4,
        'degrees':        10.0,       # 회전 범위
        'translate':      0.1,        # 평행 이동
        'scale':          0.5,        # 스케일 변화
        'shear':          2.0,        # 전단 변환
        'flipud':         0.0,        # 상하 뒤집기
        'fliplr':         0.5,        # 좌우 뒤집기
    }

    model.train(**train_params)
    print("[Train] Finished.")

if __name__ == "__main__":
    main()
