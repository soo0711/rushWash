import os
from transformers import AutoTokenizer, AutoModelForCausalLM

model_id = "kakaocorp/kanana-nano-2.1b-base"
save_dir = "./llm/kanana-nano-2.1b-base"

# 1. 저장 경로 디렉토리 생성 (존재하지 않으면 생성)
os.makedirs(save_dir, exist_ok=True)

# 2. 모델과 토크나이저 다운로드 및 저장
tokenizer = AutoTokenizer.from_pretrained(model_id)
model = AutoModelForCausalLM.from_pretrained(model_id)

tokenizer.save_pretrained(save_dir)
model.save_pretrained(save_dir)
