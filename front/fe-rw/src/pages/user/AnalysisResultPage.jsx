import React from "react";
import Header from "../../components/common/Header";
import { useLocation } from "react-router-dom";

const AnalysisResultPage = () => {
  const location = useLocation();
  const { analysisType, analysisData } = location.state || {};

  // 결과 섹션 렌더링 함수
  const renderResultSection = (title, type, methods) => (
    <div className="mb-8">
      {title && (
        <div className="mb-2">
          <p className="text-gray-600 text-xl">□ {title}</p>
          <p className="text-xl font-bold">{type}</p>
        </div>
      )}

      {!title && <p className="text-xl font-bold mb-2">{type}</p>}

      <div className="mt-2">
        <p className="text-gray-600 text-xl">□ 세탁방법</p>
        <div className="space-y-2 mt-2">
          {methods.map((method, index) => (
          <div key={index} className="bg-blue-100 p-3 rounded-lg text-lg">
            <p className="font-semibold">{method.title}</p>
            {method.description && (
              <p className="text-gray-700 text-base mt-1 whitespace-pre-line">
                {method.description}
              </p>
            )}
          </div>
        ))}
        </div>
      </div>
    </div>
  );

  if (!analysisData) {
    return (
      <div className="flex flex-col min-h-screen w-full bg-gray-50 sandol-font">
        <Header />
        <div className="container mx-auto max-w-md px-4 py-8 flex justify-center items-center">
          <p className="text-xl">분석 결과가 없습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen w-full bg-gray-50 sandol-font">
      <Header />

      <div className="container mx-auto max-w-md px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8">분석 결과</h1>

      {/* Both 타입인 경우 얼룩과 라벨 결과 모두 표시 */}
        {analysisType === "both" && analysisData && (
          <>
            {renderResultSection(
              "두번째로 확인된 얼룩",
              analysisData.stain.type,
              analysisData.stain.methods
            )}
            {renderResultSection(
              "라벨의 재질",
              analysisData.label.type,
              analysisData.label.methods
            )}
          </>
        )}

        {/* Stain 타입인 경우 얼룩 결과만 표시
        {analysisType === "stain" &&
          analysisData &&
          renderResultSection(
            "두번째로 확인된 얼룩",
            analysisData.type,
            analysisData.methods
          )} */}

        {/* Label 타입인 경우 라벨 결과만 표시 */}
        {analysisType === "label" &&
          analysisData &&
          renderResultSection(
            "라벨의 재질",
            analysisData.type,
            analysisData.methods
          )}

        {/* Stain 타입인 경우 얼룩 결과만 표시 */}
        {analysisType === "stain" &&
          renderResultSection("감지된 얼룩", analysisData.type, analysisData.methods)}

        {/* Label 및 Both도 확장 가능 */}
        {/* 추후 analysisType === 'both' 또는 'label'에 따라 분기 추가 가능 */}

        {/* 결과 저장 버튼 */}
        <div className="mt-8">
          <button
            className="w-full py-3 bg-sky-200 rounded-lg text-xl font-medium hover:bg-sky-300 transition-colors duration-200"
            onClick={() => alert("분석 결과가 저장되었습니다.")}
          >
            결과 저장하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnalysisResultPage;
