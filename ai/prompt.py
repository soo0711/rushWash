# test_llm_only.py
import torch
from transformers import AutoTokenizer, AutoModelForCausalLM
import os

# ───── 모델 로딩 ─────
LLM_MODEL_DIR = "llm/kanana-nano-2.1b-base"

tokenizer = AutoTokenizer.from_pretrained(LLM_MODEL_DIR, padding_side="left")
tokenizer.pad_token = tokenizer.eos_token
try:
    model = AutoModelForCausalLM.from_pretrained(
        LLM_MODEL_DIR, torch_dtype=torch.bfloat16, trust_remote_code=True
    ).to("cuda")
except (RuntimeError, ValueError):
    print("⚠️ bfloat16 미지원 → float32로 재시도")
    model = AutoModelForCausalLM.from_pretrained(
        LLM_MODEL_DIR, torch_dtype=torch.float32, trust_remote_code=True
    ).to("cuda")


# ───── 프롬프트 생성 함수 ─────
def build_llm_prompt(stain_class, stain_advices, label_expls):
    stain_list_text = "\n".join(
        [f"{i+1}. {advice}" for i, advice in enumerate(stain_advices)]
    )
    label_text = (
        "세탁 기호가 감지되지 않았습니다."
        if not label_expls
        else ", ".join(label_expls)
    )

    return (
        f"얼룩 종류: {stain_class}\n"
        f"감지된 세탁 기호: {label_text}\n"
        f"가능한 얼룩 제거법:\n{stain_list_text}\n\n"
        f"조건:\n"
        f"- 금지된 세탁 조건을 절대 위반하지 마세요.\n"
        f"- 제거법 중 세탁 기호에 위배되지 않는 하나만 선택하세요.\n"
        f"- 선택한 제거법을 명령형 한 문장으로 작성하세요.\n"
        f"- 다른 문장 없이 그 문장 하나만 출력하세요.\n"
        f"- 세탁이 불가능하다면 '물세탁이 불가능하므로 세탁소에 맡기세요.'라고 출력하세요.\n\n"
        f"세탁 방법:"
    )


# ───── 테스트 입력 ─────
stain_class = "blood"
stain_advices = [
    "찬물로 씻은 후 과산화수소를 뿌려 살살 비벼준 다음 다시 찬물로 헹구어 세탁한다.",
    "따뜻한 물과 비누로 얼룩 부위를 살짝 문지른 뒤, 소금물에 담가 거품을 내며 세탁한다.",
    "피가 굳은 경우, 치약을 발라 10분간 둔 뒤 굳은 부분을 찬물로 헹구어 제거한다.",
]
label_expls = [
    "회전식 건조기 사용 금지.",
    "세탁 금지: 물세탁을 하지 마세요.",
    "표백 금지: 산소계, 염소계 표백제를 모두 사용하지 마세요.",
    "다림질 금지: 열에 의해 손상될 수 있습니다.",
    "드라이클리닝 가능.",
]
label_warnings = [desc for desc in label_expls if "금지" in desc]

# ───── LLM 실행 ─────
prompt = build_llm_prompt(stain_class, stain_advices, label_expls)

input_ids = tokenizer(prompt, return_tensors="pt").to("cuda")["input_ids"]
with torch.no_grad():
    output = model.generate(
        input_ids,
        max_new_tokens=256,
        do_sample=True,
        temperature=0.6,
        top_p=0.85,
        top_k=30,
        pad_token_id=tokenizer.eos_token_id,
    )
decoded = tokenizer.decode(output[0], skip_special_tokens=True)

if "세탁 방법:" in decoded:
    result = decoded.split("세탁 방법:")[-1].strip()
else:
    result = decoded.strip()

print("───────────────────── LLM 결과 ─────────────────────")
print(result)
print("─────────────────────────────────────────────────────")
