import React, { useState, useEffect, useRef } from "react";
import Header from "../../components/common/Header";
import { Link, useParams } from "react-router-dom";
import axios from "axios";

const FabricSoftenerResultPage = () => {
  const { categoryId } = useParams(); // URL에서 카테고리 ID 받기
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  // 컴포넌트 최상위 레벨에 useRef 선언
  const alertShownRef = useRef(false);


useEffect(() => {
  // 새로운 categoryId가 들어올 때마다 ref를 초기화
  alertShownRef.current = false;
  
  const fetchData = async () => {
    try {
      setLoading(true);
      const scent = categoryId || "refreshing";
      const response = await axios.get(`/fabric-softeners/${scent}`);

      // 성공 응답일 때
      if (response.data.success) {
        const scentMap = {
          refreshing: "상쾌한 향",
          floral: "꽃 향",
          fruity: "과일 향",
          woody: "우디한 향",
          powdery: "파우더 향",
          citrus: "시트러스 향",
        };

        setCategory({ id: scent, name: scentMap[scent] || "알 수 없음" });

        const products = response.data.data.map((item, index) => ({
          id: index + 1,
          brand: item.brand,
          name: item.productName,
          imageUrl: item.imageUrl,
        }));

        setProducts(products);
      } else {
        // 여기엔 success가 false인 정상 응답 처리
        const errorMsg = response.data.error?.message || "알 수 없는 오류가 발생했습니다.";
        if (!alertShownRef.current) {
          alert(`에러 발생: ${errorMsg}`);
          alertShownRef.current = true;
          window.history.back();
        }

        setProducts([]);
        setCategory({ id: scent, name: "알 수 없음" });
      }
    } catch (error) {
      // axios 에러 처리
      if (error.response) {
        // 서버가 응답했지만 오류 상태코드일 때
        if (error.response.status === 404) {
          // 404 Not Found 에러 처리
          if (!alertShownRef.current) {
            alert("해당 향기 카테고리를 찾을 수 없습니다. 다시 선택해주세요.");
            alertShownRef.current = true;
            window.history.back();
          }
        } else {
          // 그 외 상태코드 에러 처리
          if (!alertShownRef.current) {
            alert(`서버 에러: ${error.response.status} - ${error.response.statusText}`);
            alertShownRef.current = true;
            window.history.back();
          }
        }
      } else if (error.request) {
        // 요청은 되었으나 응답이 없는 경우 (네트워크 문제 등)
        console.error("서버 또는 네트워크 에러:", error);
        if (!alertShownRef.current) {
          alert("서버에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.");
          alertShownRef.current = true;
          window.history.back();
        }
      } else {
        // 요청 설정 중 발생한 에러
        if (!alertShownRef.current) {
          alert("알 수 없는 오류가 발생했습니다.");
          alertShownRef.current = true;
          window.history.back();
        }
      }

      setProducts([]);
      setCategory({ id: "error", name: "오류" });
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
              {/* 제품 이미지 */}
              <div className="w-24 h-24 rounded-md overflow-hidden flex-shrink-0 mr-4">
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="w-full h-full bg-blue-100 flex items-center justify-center">
                    <span className="text-blue-500 text-xs text-center">이미지 없음</span>
                  </div>
                )}
              </div>

              <div className="flex-grow">
                <p className="text-blue-600 text-lg font-medium">{product.brand}</p>
                <h3 className="text-xl font-semibold text-gray-800">{product.name}</h3>
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
