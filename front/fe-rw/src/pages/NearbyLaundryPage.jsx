import React, { useState } from "react";
import Header from "../components/common/Header";
import { Link } from "react-router-dom";

const NearbyLaundryPage = () => {
  // 검색어 상태 관리
  const [searchQuery, setSearchQuery] = useState("");

  // 목업 데이터 - 근처 세탁소 목록
  const [laundryShops, setLaundryShops] = useState([
    {
      id: 1,
      name: "더런드리 가양점",
      rating: 3.0,
      distance: "413m",
      address: "서울시 강서구 가양동",
      imageUrl: null, // 실제로는 세탁소 이미지 또는 지도 마커 이미지
    },
    {
      id: 2,
      name: "크린토피아 가양강변점",
      rating: 3.0,
      distance: "593m",
      address: "서울시 강서구 가양동",
      imageUrl: null,
    },
    {
      id: 3,
      name: "깨끗한나라 가양점",
      rating: 3.0,
      distance: "613m",
      address: "서울시 강서구 가양동",
      imageUrl: null,
    },
    {
      id: 4,
      name: "세탁명가 가양점",
      rating: 4.0,
      distance: "750m",
      address: "서울시 강서구 가양동",
      imageUrl: null,
    },
    {
      id: 5,
      name: "스피드세탁 방화점",
      rating: 4.5,
      distance: "890m",
      address: "서울시 강서구 방화동",
      imageUrl: null,
    },
  ]);

  // 검색 처리
  const handleSearch = () => {
    // 실제로는 API 호출 등의 작업을 수행
    alert(`"${searchQuery}" 검색을 실행합니다.`);
  };

  // 검색어 변경 핸들러
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Enter 키 핸들러
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // 별점 렌더링 함수
  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

    return (
      <div className="flex items-center">
        <span className="text-lg mr-1 font-semibold">{rating.toFixed(1)}</span>
        <div className="flex">
          {[...Array(fullStars)].map((_, i) => (
            <span key={`full-${i}`} className="text-yellow-500">
              ★
            </span>
          ))}
          {halfStar && <span className="text-yellow-500">★</span>}
          {[...Array(emptyStars)].map((_, i) => (
            <span key={`empty-${i}`} className="text-gray-300">
              ★
            </span>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-screen w-full bg-gray-50 sandol-font">
      <Header />

      <div className="container mx-auto max-w-md px-0 text-2xl">
        {/* 검색 바 - 헤더와 동일한 색상(#B7F3FF)과 간격 추가 */}
        <div className="bg-[#B7F3FF] p-4 shadow-md mt-3 mx-3 rounded-lg">
          <div className="relative">
            <input
              type="text"
              placeholder="세탁소 검색..."
              className="w-full px-4 py-2 pr-10 rounded-full border border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all duration-200"
              value={searchQuery}
              onChange={handleSearchChange}
              onKeyPress={handleKeyPress}
            />
            <button
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-500 text-white p-1.5 rounded-full hover:bg-blue-600 transition-colors duration-200"
              onClick={handleSearch}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                ></path>
              </svg>
            </button>
          </div>
        </div>

        {/* 가까운 세탁소 텍스트 */}
        <div className="px-4 py-3 border-b bg-white mt-3 mx-3 rounded-t-lg">
          <h2 className="text-2xl font-bold text-blue-800">가까운 세탁소</h2>
        </div>

        {/* 세탁소 목록 */}
        <div className="divide-y bg-white shadow-md mx-3 mb-3 rounded-b-lg overflow-hidden">
          {laundryShops.map((shop) => (
            <div
              key={shop.id}
              className="p-4 flex items-center hover:bg-blue-50 transition-colors duration-200"
            >
              {/* 지도 마커 이미지 */}
              <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-blue-100 to-blue-200 flex-shrink-0 mr-4 shadow-md border-2 border-white">
                <div className="w-full h-full flex items-center justify-center">
                  <svg
                    className="w-10 h-10 text-red-500 drop-shadow-md"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>

              {/* 세탁소 정보 */}
              <div className="flex-grow">
                <h3 className="text-2xl font-semibold text-blue-900">
                  {shop.name}
                </h3>
                <div className="flex items-center">
                  {renderStars(shop.rating)}
                </div>
                <p className="text-gray-600 text-sm flex items-center mt-1">
                  <svg
                    className="w-4 h-4 mr-1 text-blue-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    ></path>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    ></path>
                  </svg>
                  <span className="font-medium text-blue-700">
                    {shop.distance}
                  </span>
                  <span className="mx-1">·</span>
                  <span>{shop.address}</span>
                </p>
              </div>

              {/* 화살표 아이콘 (상세 페이지로 이동) */}
              <div className="ml-2 text-gray-400">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 5l7 7-7 7"
                  ></path>
                </svg>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NearbyLaundryPage;
