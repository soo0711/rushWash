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
    "kakaocorp/kanana-nano-2.1b-base",
]

# ─── 샘플 입력 ───
SAMPLES = [
    {
        "stain": {"class": "blood", "advice": "찬물에 불린 후 단백질 분해 효소가 포함된 세제로 세탁하세요."},
        "labels": [
            "40도 이하에서 일반 세탁 가능합니다.",
            "표백 금지: 산소계, 염소계 표백제를 모두 사용하지 마세요.",
            "그늘에서 옷걸이나 줄에 널어 말리세요."
        ]
    },
    {
        "stain": {"class": "coffee", "advice": "즉시 찬물로 헹군 후 산소계 표백제를 사용해 세탁하세요."},
        "labels": [
            "30도에서 섬세 세탁하세요.",
            "건조기 사용 금지",
            "중간 온도에서 다림질하세요."
        ]
    }
]

# ─── 프롬프트 구성 ───
def build_prompt(sample):
    return (
        f"다음은 옷의 얼룩과 세탁 기호에 대한 분석 결과입니다.\n"
        f"- 얼룩 종류: {sample['stain']['class']}\n"
        f"- 추천 세탁법: {sample['stain']['advice']}\n"
        f"- 세탁 기호 해석: {', '.join(sample['labels'])}\n\n"
        "위 정보를 참고하여 사용자에게 친절하고 자연스러운 세탁 가이드를 작성해주세요.\n\n답변:"
    )

# ─── 모델 벤치마크 ───
def benchmark_model(model_name, samples):
    print(f"\n📥 모델 로딩 중: {model_name}")
    try:
        tokenizer = AutoTokenizer.from_pretrained(model_name, token=HF_TOKEN, padding_side="left")
        tokenizer.pad_token = tokenizer.eos_token

        # dtype 우선순위: float16 → float32 (bfloat16은 생략)
        try:
            model = AutoModelForCausalLM.from_pretrained(
                model_name,
                torch_dtype=torch.float16,
                trust_remote_code=True
            ).to("cuda")
        except (RuntimeError, ValueError) as e:
            print("⚠️ float16 오류 → float32로 fallback")
            model = AutoModelForCausalLM.from_pretrained(
                model_name,
                torch_dtype=torch.float32,
                trust_remote_code=True
            ).to("cuda")

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
                max_new_tokens=128,
                do_sample=True,
                temperature=0.7,
                top_k=50,
                top_p=0.9,
                pad_token_id=tokenizer.eos_token_id
            )
            elapsed = time.time() - start

            decoded = tokenizer.decode(output[0], skip_special_tokens=True).split("답변:")[-1].strip()

            results.append({
                "input": sample,
                "elapsed_time_sec": round(elapsed, 2),
                "guide": decoded
            })

        except Exception as e:
            print(f"⚠️ 샘플 {i+1} 처리 오류: {e}")
            results.append({
                "input": sample,
                "error": str(e)
            })

    del model, tokenizer
    torch.cuda.empty_cache()
    gc.collect()

    return {"model": model_name, "results": results}

# ─── 실행 ───
def run_benchmark():
    for model in MODELS:
        print(f"\n⏳ 모델 실행 시작: {model}")
        try:
            result = benchmark_model(model, SAMPLES)
            save_path = f"benchmark_result_fixed_{model.replace('/', '_')}.json"
            with open(save_path, "w", encoding="utf-8") as f:
                json.dump(result, f, ensure_ascii=False, indent=2)
            print(f"✅ 저장 완료: {save_path}")
        except Exception as e:
            print(f"❌ {model} 전체 처리 실패: {e}")

# ─── 시작점 ───
if __name__ == "__main__":
    run_benchmark()
