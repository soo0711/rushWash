import React, { useState, useEffect } from "react";
import Header from "../../components/common/Header";
import { Link, useParams, useLocation } from "react-router-dom";

const AnalysisResultPage = () => {
  const { analysisType } = useParams(); // 'both', 'stain', 'label' 중 하나
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [analysisData, setAnalysisData] = useState(null);

  // 목업 결과 데이터
  const mockResults = {
    stain: {
      type: "고추장",
      methods: [
        {
          title: "아염소 + 물 세어 얼룩 위에 뿌려준 다음 30분 후 세탁기 돌리기",
          description: "아염소와 물을 1:4 비율로 섞어 바로 사용하세요.",
        },
        {
          title: "베이킹소다 + 물 + 식초",
          description:
            "베이킹소다와 물을 섞어 페이스트를 만들고 얼룩에 바른 후 식초를 뿌려주세요.",
        },
      ],
    },
    label: {
      type: "피",
      methods: [
        {
          title: "소금 + 물",
          description: "찬물에 소금을 녹인 후 얼룩이 있는 부분을 담가두세요.",
        },
        {
          title: "과산화수소",
          description:
            "3% 과산화수소를 얼룩 부분에 직접 바르고 부드러운 브러쉬로 문지르세요.",
        },
      ],
    },
    both: {
      stain: {
        type: "고추장",
        methods: [
          {
            title:
              "아염소 + 물 세어 얼룩 위에 뿌려준 다음 30분 후 세탁기 돌리기",
            description: "아염소와 물을 1:4 비율로 섞어 바로 사용하세요.",
          },
        ],
      },
      label: {
        type: "면/린넨",
        methods: [
          {
            title: "중성세제 + 미온수",
            description: "30°C 미온수에 중성세제를 풀어 손세탁하세요.",
          },
        ],
      },
    },
  };

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    // 실제로는 API 호출을 통해 데이터를 가져옴
    // 여기서는 목업 데이터 사용
    const loadData = () => {
      // URL 파라미터가 없으면 기본값 'both' 사용
      const type = analysisType || "both";

      // 분석 결과 데이터 설정
      setAnalysisData(mockResults[type]);

      setLoading(false);
    };

    // 데이터 로드 시뮬레이션
    setTimeout(loadData, 500);
  }, [analysisType]);

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
              {method.title}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen w-full bg-gray-50 sandol-font">
        <Header />
        <div className="container mx-auto max-w-md px-4 py-8 flex justify-center items-center">
          <p className="text-xl">로딩 중...</p>
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

        {/* Stain 타입인 경우 얼룩 결과만 표시 */}
        {analysisType === "stain" &&
          analysisData &&
          renderResultSection(
            "두번째로 확인된 얼룩",
            analysisData.type,
            analysisData.methods
          )}

        {/* Label 타입인 경우 라벨 결과만 표시 */}
        {analysisType === "label" &&
          analysisData &&
          renderResultSection(
            "라벨의 재질",
            analysisData.type,
            analysisData.methods
          )}

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
