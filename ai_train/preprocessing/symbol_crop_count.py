import os
import matplotlib.pyplot as plt

# 데이터셋 경로 설정 (윈도우 경로)
dataset_path = "C:\LAB\python\original_washtag_dataset"

# 클래스 번호와 카운트를 저장할 리스트 초기화
class_labels = [str(i) for i in range(43)]
class_counts = []

# 각 클래스 디렉토리(0~42) 내 파일 개수 계산
for i in range(43):
    class_dir = os.path.join(dataset_path, str(i))
    if os.path.isdir(class_dir):
        files = [f for f in os.listdir(class_dir) 
                 if os.path.isfile(os.path.join(class_dir, f))]
        count = len(files)
    else:
        count = 0
    class_counts.append(count)

# 그래프 그리기
plt.figure(figsize=(12, 6))
plt.bar(class_labels, class_counts)
plt.xlabel("Class")
plt.ylabel("Number of images")
plt.title("Number of images per class")
plt.xticks(rotation=90)
plt.tight_layout()

# 저장 및 출력
output_path = "class_distribution.png"
plt.savefig(output_path)
plt.show()

print(f"Saved bar chart to {output_path}")
