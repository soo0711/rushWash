from transformers import AutoTokenizer, AutoModelForCausalLM

model_id = "kakaocorp/kanana-nano-2.1b-base"
save_dir = "./llm/kanana-nano-2.1b-base"

# 모델과 토크나이저 다운로드 및 저장
tokenizer = AutoTokenizer.from_pretrained(model_id)
model = AutoModelForCausalLM.from_pretrained(model_id)

tokenizer.save_pretrained(save_dir)
model.save_pretrained(save_dir)
