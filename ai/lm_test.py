import os
import time
import json
import torch
import gc
from dotenv import load_dotenv
from transformers import AutoTokenizer, AutoModelForCausalLM

# ─── 환경변수 로딩 ───
load_dotenv()
HF_TOKEN = os.getenv("HUGGINGFACE_TOKEN")

# ─── 모델 리스트 ───
MODELS = [
    "kakaocorp/kanana-1.5-2.1b-base",
    "kakaocorp/kanana-nano-2.1b-base",
]

# ─── 샘플 입력 ───
SAMPLES = [
    {
        "stain": {
            "class": "blood",
            "advice": "찬물에 불린 후 단백질 분해 효소가 포함된 세제로 세탁하세요.",
        },
        "labels": [
            "40도 이하에서 일반 세탁 가능합니다.",
            "표백 금지: 산소계, 염소계 표백제를 모두 사용하지 마세요.",
            "그늘에서 옷걸이나 줄에 널어 말리세요.",
        ],
    },
    {
        "stain": {
            "class": "coffee",
            "advice": "즉시 찬물로 헹군 후 산소계 표백제를 사용해 세탁하세요.",
        },
        "labels": [
            "30도에서 섬세 세탁하세요.",
            "건조기 사용 금지",
            "중간 온도에서 다림질하세요.",
        ],
    },
]
CONTRADICTORY_SAMPLES = [
    {
        "stain": {
            "class": "blood",
            "advice": "암모니아 용액(물:암모니아 = 2:1)을 묻혀 처리한 뒤 세탁하세요.",
        },
        "labels": [
            "세탁 금지: 물세탁을 하지 마세요.",
            "표백 금지: 산소계, 염소계 표백제를 모두 사용하지 마세요.",
            "건조 금지: 열 건조나 자연 건조 모두 피해야 합니다.",
        ],
    },
    {
        "stain": {
            "class": "coffee",
            "advice": "미지근한 물에 불린 후 중성세제 또는 산소계 표백제로 세탁하세요.",
        },
        "labels": [
            "드라이클리닝 금지: 전문가 세탁소에 맡기는 것도 금지입니다.",
            "건조기 사용 금지",
            "고온 다림질 가능: 약 200°C 이하에서 사용.",
        ],
    },
    {
        "stain": {
            "class": "lipstick",
            "advice": "중성세제와 베이킹 소다를 섞어 얼룩에 바르고 문지른 뒤 세탁하세요.",
        },
        "labels": [
            "습식 세탁 금지: 전문가용 습식 세탁도 금지입니다.",
            "표백 금지: 산소계, 염소계 표백제를 모두 사용하지 마세요.",
            "다림질 금지: 열에 의해 손상될 수 있습니다.",
        ],
    },
]


# ─── 프롬프트 구성 ───
def build_prompt(sample):
    return (
        f"아래는 옷에 묻은 얼룩과 해당 세탁 기호에 대한 설명입니다.\n"
        f"- 얼룩 종류는 {sample['stain']['class']}이며,\n"
        f"- 해당 얼룩에 대해 추천되는 세탁법은 다음과 같습니다: {sample['stain']['advice']}\n"
        f"- 세탁 기호는 다음과 같습니다: {', '.join(sample['labels'])}\n\n"
        "이 정보를 바탕으로, 옷을 어떻게 세탁해야 하는지 부드럽고 자연스러운 한 문단으로 설명하세요. "
        "사용자에게 말하듯 쓰되, 인사말 없이 직접적인 명령형으로 작성하세요.\n\n세탁 방법:"
    )


# ─── 모델 벤치마크 ───
def benchmark_model(model_name, samples):
    print(f"\n📥 모델 로딩 중: {model_name}")
    try:
        tokenizer = AutoTokenizer.from_pretrained(
            model_name, token=HF_TOKEN, padding_side="left"
        )
        tokenizer.pad_token = tokenizer.eos_token

        try:
            model = AutoModelForCausalLM.from_pretrained(
                model_name,
                token=HF_TOKEN,
                torch_dtype=torch.bfloat16,
                trust_remote_code=True,
            ).to("cuda")
        except (RuntimeError, ValueError) as e:
            if "addmm_impl_cpu_" in str(e) or "not implemented for" in str(e):
                print("⚠️ bfloat16 문제 → float32로 재시도")
                model = AutoModelForCausalLM.from_pretrained(
                    model_name, torch_dtype=torch.float32, trust_remote_code=True
                ).to("cuda")
            else:
                raise e

    except Exception as e:
        print(f"❌ 모델 로딩 실패: {e}")
        return {"model": model_name, "error": str(e), "results": []}

    results = []
    for i, sample in enumerate(samples):
        try:
            prompt = build_prompt(sample)
            input_ids = tokenizer(prompt, return_tensors="pt")["input_ids"].to("cuda")

            start = time.time()
            output = model.generate(
                input_ids,
                max_new_tokens=256,  # 늘림
                do_sample=True,
                temperature=0.7,
                top_k=50,
                top_p=0.9,
                pad_token_id=tokenizer.eos_token_id,
            )
            elapsed = time.time() - start

            decoded = (
                tokenizer.decode(output[0], skip_special_tokens=True)
                .split("세탁 방법:")[-1]
                .strip()
            )

            results.append(
                {
                    "input": sample,
                    "elapsed_time_sec": round(elapsed, 2),
                    "guide": decoded,
                }
            )

        except Exception as e:
            print(f"⚠️ 샘플 {i+1} 처리 오류: {e}")
            results.append({"input": sample, "error": str(e)})

    del model, tokenizer
    torch.cuda.empty_cache()
    gc.collect()

    return {"model": model_name, "results": results}


# ─── 실행 ───
def run_benchmark():
    for model in MODELS:
        print(f"\n⏳ 모델 실행 시작: {model}")
        try:
            result = benchmark_model(model, CONTRADICTORY_SAMPLES)
            save_path = f"benchmark_result_fixed_{model.replace('/', '_')}.json"
            with open(save_path, "w", encoding="utf-8") as f:
                json.dump(result, f, ensure_ascii=False, indent=2)
            print(f"✅ 저장 완료: {save_path}")
        except Exception as e:
            print(f"❌ {model} 전체 처리 실패: {e}")


# ─── 시작점 ───
if __name__ == "__main__":
    run_benchmark()
