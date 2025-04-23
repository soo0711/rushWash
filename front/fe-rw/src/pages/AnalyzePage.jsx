import React from "react";
import Header from "../components/common/Header";
import { Link } from "react-router-dom";

const AnalyzePage = () => {
  return (
    <div className="flex flex-col min-h-screen w-full bg-gray-50 sandol-font">
      <Header />

      {/* 분석하기 페이지 내용 */}
      <div className="container mx-auto max-w-md px-4 py-8">
        <h1 className="text-5xl font-bold text-center mb-8 sandol-font">
          분석하기
        </h1>

        <div className="space-y-20">
          {/* 세 개의 버튼 */}
          <Link to="/analyze/both">
            <button className="w-full rounded-full bg-sky-200 p-4 text-center text-2xl font-medium mb-8">
              얼룩과 라벨에 관한 세탁방법
            </button>
          </Link>

          <Link to="/analyze/stain">
            <button className="w-full rounded-full bg-sky-200 p-4 text-center text-2xl font-medium mb-8">
              얼룩에 관한 세탁방법
            </button>
          </Link>

          <Link to="/analyze/label">
            <button className="w-full rounded-full bg-sky-200 p-4 text-center text-2xl font-medium mb-8">
              라벨에 관한 세탁방법
            </button>
          </Link>
        </div>

        {/* 예시 이미지 섹션 */}
        <div className="mt-8">
          <p className="text-xl mb-3">등록 시진 예시)</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col items-center">
              <img
                src={require("../assets/images/home.png")}
                alt="얼룩 예시"
                className="w-full h-auto rounded-md"
              />
              <p className="mt-2 text-center">얼룩</p>
            </div>
            <div className="flex flex-col items-center">
              <img
                src={require("../assets/images/home.png")}
                alt="라벨 예시"
                className="w-full h-auto rounded-md"
              />
              <p className="mt-2 text-center">라벨</p>
            </div>
          </div>
        </div>

        {/* 홈 버튼 */}
        <div className="absolute bottom-4 right-4">
          <Link to="/">
            <img
              src={require("../assets/images/home.png")}
              alt="홈으로"
              className="w-24 h-20"
            />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AnalyzePage;
