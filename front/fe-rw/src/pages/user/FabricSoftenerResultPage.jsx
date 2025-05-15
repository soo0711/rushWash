import React, { useState, useEffect } from "react";
import Header from "../../components/common/Header";
import { Link, useParams } from "react-router-dom";

const FabricSoftenerResultPage = () => {
  const { categoryId } = useParams(); // URL에서 카테고리 ID 받기
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);

  // 목업 카테고리 데이터
  const mockCategories = [
    { id: "1", name: "상쾌한 향" },
    { id: "2", name: "꽃 향" },
    { id: "3", name: "과일 향" },
    { id: "4", name: "우디한 향" },
    { id: "5", name: "파우더 향" },
    { id: "6", name: "시트러스 향" },
  ];

  // 목업 제품 데이터 - 카테고리별 제품
  const mockProductsByCategory = {
    1: [
      {
        id: 1,
        brand: "다우니",
        name: "초고농축 섬유유연제 클린브리즈",
        imageUrl: null,
      },
      {
        id: 2,
        brand: "피죤",
        name: "섬유유연제 레귤러",
        imageUrl: null,
      },
      {
        id: 3,
        brand: "스너글",
        name: "블루 스파클",
        imageUrl: null,
      },
    ],
    2: [
      {
        id: 4,
        brand: "샤프란",
        name: "꽃담초 피오니",
        imageUrl: null,
      },
      {
        id: 5,
        brand: "다우니",
        name: "에이프릴 프레쉬",
        imageUrl: null,
      },
      {
        id: 6,
        brand: "스너글",
        name: "벚꽃 향기",
        imageUrl: null,
      },
    ],
    3: [
      {
        id: 7,
        brand: "샤프란",
        name: "애플 매직",
        imageUrl: null,
      },
      {
        id: 8,
        brand: "피죤",
        name: "시트러스 가든",
        imageUrl: null,
      },
    ],
    4: [
      {
        id: 9,
        brand: "르네셀",
        name: "시크릿 우드",
        imageUrl: null,
      },
      {
        id: 10,
        brand: "랑벨",
        name: "프리미엄 우디향",
        imageUrl: null,
      },
    ],
    5: [
      {
        id: 11,
        brand: "닥터슈슈",
        name: "파우더 코튼",
        imageUrl: null,
      },
      {
        id: 12,
        brand: "코튼블루",
        name: "파우더 프레쉬",
        imageUrl: null,
      },
    ],
    6: [
      {
        id: 13,
        brand: "다우니",
        name: "레몬그라스 리프레셔",
        imageUrl: null,
      },
      {
        id: 14,
        brand: "피죤",
        name: "시트러스 선샤인",
        imageUrl: null,
      },
    ],
  };

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    // 실제로는 API 호출을 통해 데이터를 가져옴
    // 여기서는 목업 데이터 사용
    const loadData = () => {
      // URL 파라미터가 없으면 기본값 1 (상쾌한 향) 사용
      const id = categoryId || "1";

      // 카테고리 찾기
      const selectedCategory = mockCategories.find((c) => c.id === id);
      setCategory(selectedCategory);

      // 제품 목록 가져오기
      setProducts(mockProductsByCategory[id] || []);

      setLoading(false);
    };

    // 데이터 로드 시뮬레이션
    setTimeout(loadData, 500);
  }, [categoryId]);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen w-full bg-gradient-to-b from-[#e6f7ff] to-white sandol-font">
        <Header />
        <div className="container mx-auto max-w-md px-4 py-8 flex justify-center items-center">
          <p className="text-xl">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen w-full bg-gradient-to-b from-[#e6f7ff] to-white sandol-font">
      <Header />

      <div className="container mx-auto max-w-md px-4 py-8">
        <div className="flex items-center mb-6">
          <Link to="/fabricsoftener" className="mr-3 text-blue-500">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 19l-7-7 7-7"
              ></path>
            </svg>
          </Link>
          <h1 className="text-3xl font-bold text-blue-800">
            "{category?.name}" 추천 결과
          </h1>
        </div>

        <div className="space-y-4">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white p-5 rounded-lg shadow-md flex items-center hover:shadow-lg transition-shadow duration-200"
            >
              {/* 제품 이미지 (실제로는 제품 이미지가 있을 것) */}
              <div className="w-24 h-24 bg-blue-100 rounded-md flex items-center justify-center mr-4 flex-shrink-0">
                <span className="text-blue-500 text-xs text-center">
                  제품 이미지
                </span>
              </div>

              <div className="flex-grow">
                <p className="text-blue-600 text-lg font-medium">
                  {product.brand}
                </p>
                <h3 className="text-xl font-semibold text-gray-800">
                  {product.name}
                </h3>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 p-4 bg-blue-50 rounded-lg shadow-inner">
          <h3 className="text-center text-blue-800 text-lg font-medium mb-2">
            추천 세탁 TIP
          </h3>
          <p className="text-blue-700 text-lg">
            섬유유연제는 마지막 헹굼 단계에서 넣어주세요. 세제와 함께 사용하면
            효과가 떨어질 수 있습니다.
          </p>
        </div>
      </div>
    </div>
  );
};

export default FabricSoftenerResultPage;
