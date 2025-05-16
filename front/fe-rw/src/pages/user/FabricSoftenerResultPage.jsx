import React, { useState, useEffect } from "react";
import Header from "../../components/common/Header";
import { Link, useParams } from "react-router-dom";
import axios from "axios";

const FabricSoftenerResultPage = () => {
  const { categoryId } = useParams(); // URL에서 카테고리 ID 받기
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);

    // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
  // 컴포넌트 마운트 시 데이터 로드
  // 실제로는 API 호출을 통해 데이터를 가져옴
  const fetchData = async () => {
    try {
      setLoading(true);

      // URL 파라미터가 없으면 기본값 "refreshing" (상쾌한 향) 사용
      const scent = categoryId || "refreshing";

      // GET 방식으로 백엔드 API 호출
      const response = await axios.get(`/fabric-softeners/${scent}`);

      if (response.data.success) {
        // scent 키워드 → 사용자 친화적인 한글 카테고리 이름으로 매핑
        const scentMap = {
          refreshing: "상쾌한 향",
          floral: "꽃 향",
          fruity: "과일 향",
          woody: "우디한 향",
          powdery: "파우더 향",
          citrus: "시트러스 향",
        };

        // 카테고리 설정
        setCategory({ id: scent, name: scentMap[scent] || "알 수 없음" });

        // 제품 목록 가져오기
        const products = response.data.data.map((item, index) => ({
          id: index + 1,
          brand: item.brand,
          name: item.productName,
          imageUrl: null, // 실제로는 제품 이미지가 있을 것
        }));

        setProducts(products);
      } else {
        console.error("API 응답 에러:", response.data.error);
      }
    } catch (error) {
      console.error("데이터 가져오기 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  fetchData();
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
