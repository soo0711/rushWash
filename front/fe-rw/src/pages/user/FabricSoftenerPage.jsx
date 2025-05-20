import React from "react";
import Header from "../../components/common/Header";
import { Link, useNavigate } from "react-router-dom";

const FabricSoftenerPage = () => {
  const navigate = useNavigate();
  // 섬유유연제 향 카테고리 목업 데이터
  const scentCategories = [
    { id: "refreshing", name: "상쾌한 향", icon: "🌊" },
    { id: "floral", name: "꽃 향", icon: "🌸" },
    { id: "fruity", name: "과일 향", icon: "🍎" },
    { id: "woody", name: "우디한 향", icon: "🌲" },
    { id: "powdery", name: "파우더 향", icon: "✨" },
    { id: "citrus", name: "시트러스 향", icon: "🍋" },
  ];

  const handleCategorySelect = (categoryId) => {
    navigate(`/fabricsoftener/result/${categoryId}`);
  };

  return (
    <div className="flex flex-col min-h-screen w-full bg-gradient-to-b  to-white sandol-font">
      <Header />

      <div className="container mx-auto max-w-md px-4 py-12 flex flex-col items-center">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold text-blue-800 mb-3">
            내가 좋아하는 향기는?
          </h1>
          <p className="text-blue-600">
            나에게 딱 맞는 섬유유연제를 찾아보세요
          </p>
        </div>

        <div className="w-full max-w-sm space-y-5">
          {scentCategories.map((category) => (
            <button
              key={category.id}
              className="w-full py-4 px-6 bg-blue-300 text-center rounded-full text-2xl font-medium hover:bg-blue-400 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1 flex items-center justify-center"
              onClick={() => handleCategorySelect(category.id)}
            >
              <span className="mr-3 text-3xl">{category.icon}</span>
              <span>{category.name}</span>
            </button>
          ))}
        </div>

        <div className="mt-16 p-4 bg-blue-50 rounded-lg shadow-inner max-w-sm w-full">
          <h3 className="text-center text-2xl text-blue-800 font-medium mb-2">
            알고 계셨나요?
          </h3>
          <p className="text-blue-700 text-lg text-center">
            섬유유연제는 정전기 방지와 섬유 부드러움 유지에 도움을 줄 뿐만
            아니라, 좋아하는 향으로 기분 전환에도 효과적입니다.
          </p>
        </div>
      </div>
    </div>
  );
};

export default FabricSoftenerPage;
