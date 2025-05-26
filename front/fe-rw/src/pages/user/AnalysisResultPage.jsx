import React, { useState, useEffect } from "react";
import Header from "../../components/common/Header";
import { useLocation, useNavigate } from "react-router-dom";
import { ANALYSIS_API } from "../../constants/api";
import axios from "axios";

const AnalysisResultPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // location.state에서 직접 분석 결과를 받아오는 경우와 API 호출하는 경우 구분
  const {
    analysisType,
    analysisData: passedAnalysisData,
    files,
  } = location.state || {};

  const [loading, setLoading] = useState(!passedAnalysisData); // 이미 데이터가 있으면 로딩 안함
  const [error, setError] = useState("");
  const [analysisData, setAnalysisData] = useState(passedAnalysisData || null);

  // API 호출 함수 (필요한 경우에만)
  const fetchAnalysisResult = async () => {
    if (!files || !analysisType || passedAnalysisData) {
      if (!passedAnalysisData && !files) {
        setError("분석할 파일이 없습니다.");
      }
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken");

      let response;

      if (analysisType === "stain") {
        // 얼룩 분석
        const formData = new FormData();
        formData.append("file", files.stainFile);

        response = await axios.post(ANALYSIS_API.STAIN, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: token ? `Bearer ${token}` : "",
          },
        });
      } else if (analysisType === "label") {
        // 라벨 분석
        const formData = new FormData();
        formData.append("file", files.labelFile);

        response = await axios.post(ANALYSIS_API.LABEL, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: token ? `Bearer ${token}` : "",
          },
        });
      } else if (analysisType === "both") {
        // 얼룩과 라벨 분석
        const formData = new FormData();
        formData.append("stainFile", files.stainFile);
        formData.append("labelFile", files.labelFile);

        response = await axios.post(ANALYSIS_API.STAIN_LABEL, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: token ? `Bearer ${token}` : "",
          },
        });
      }

      if (response && response.data.success) {
        const result = response.data.data;
        processAnalysisData(result, analysisType);
      } else {
        setError(response?.data?.error?.message || "분석에 실패했습니다.");
      }
    } catch (err) {
      console.error("분석 요청 실패:", err);
      setError(
        err.response?.data?.error?.message || "서버 오류로 분석에 실패했습니다."
      );
    } finally {
      setLoading(false);
    }
  };

  // 분석 데이터 처리 함수
  const processAnalysisData = (result, type) => {
    if (type === "stain") {
      const uniqueStainTypes = [
        ...new Set(result.detected_stain.top3.map((s) => s.class)),
      ];

      const instructionsMap = {};
      uniqueStainTypes.forEach((stain) => {
        const matchingInstructions = result.washing_instructions
          .filter((w) => w.class === stain)
          .map((w) => ({
            title: stain,
            description: Array.isArray(w.instructions)
              ? w.instructions.join("\n")
              : w.instruction || "세탁 방법 정보가 없습니다.",
          }));
        instructionsMap[stain] = matchingInstructions;
      });

      setAnalysisData({
        types: uniqueStainTypes,
        instructionsMap: instructionsMap,
        outputImagePath: result.output_image_path,
        detectedStains: result.detected_stain.top3, // 신뢰도 정보 포함
      });
    } else if (type === "label") {
      const detectedLabels = result.detected_labels || [];
      const labelExplanation = result.label_explanation || [];

      const methods = detectedLabels.map((label, index) => ({
        title: label,
        description: labelExplanation[index] || "",
      }));

      setAnalysisData({
        type: "라벨 분석 결과",
        methods,
        outputImagePath: result.output_image_path,
      });
    } else if (type === "both") {
      const detectedLabels = result.detected_labels || [];
      const labelExplanation = result.label_explanation || [];

      const methods = detectedLabels.map((label, index) => ({
        title: label,
        description: labelExplanation[index] || "",
      }));

      setAnalysisData({
        top1_stain: result.top1_stain,
        washing_instruction: result.washing_instruction,
        detected_labels: detectedLabels,
        label_explanation: labelExplanation,
        methods: methods,
        output_image_paths: result.output_image_paths,
        llm_generated_guide: result.llm_generated_guide,
      });
    }
  };

  useEffect(() => {
    if (!passedAnalysisData) {
      fetchAnalysisResult();
    }
  }, []);

  // 뒤로가기 핸들러
  const handleGoBack = () => {
    navigate(-1);
  };

  // 분석 유형 표시 함수
  const getAnalysisTypeText = (type) => {
    switch (type) {
      case "label":
        return "라벨";
      case "stain":
        return "얼룩";
      case "both":
        return "얼룩과 라벨";
      default:
        return type;
    }
  };

  // 얼룩 결과 섹션 렌더링 함수
  const renderStainResultSection = (
    title,
    stainType,
    instructions,
    confidence,
    index
  ) => (
    <div key={`stain-${index}`} className="mb-4 p-4 bg-gray-50 rounded-lg">
      <p className="text-sm text-gray-500 mb-1">{title}</p>
      <div className="flex items-center justify-between mb-2">
        <p className="text-gray-800 font-semibold">💧 {stainType}</p>
        {confidence && (
          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
            신뢰도: {(confidence * 100).toFixed(1)}%
          </span>
        )}
      </div>
      <div className="space-y-2">
        {Array.isArray(instructions) ? (
          instructions.map((instruction, instrIndex) => (
            <p key={instrIndex} className="text-gray-700 text-sm">
              • {instruction}
            </p>
          ))
        ) : (
          <p className="text-gray-700 text-sm whitespace-pre-line">
            {instructions}
          </p>
        )}
      </div>
    </div>
  );

  // 라벨 결과 섹션 렌더링 함수
  const renderLabelResultSection = (title, methods) => (
    <div className="mb-4 p-4 bg-gray-50 rounded-lg">
      <p className="text-sm text-gray-500 mb-1">{title}</p>
      <div className="space-y-3">
        {methods.map((method, index) => (
          <div key={index}>
            <p className="text-gray-800 font-semibold mb-1">
              🏷️ {method.title}
            </p>
            {method.description && (
              <p className="text-gray-700 text-sm whitespace-pre-line">
                {method.description}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  // 로딩 상태
  if (loading) {
    return (
      <div className="flex flex-col min-h-screen w-full bg-gray-50 sandol-font">
        <Header />
        <div className="container mx-auto max-w-md px-4 py-8 flex justify-center items-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-xl">분석 중입니다...</p>
            <p className="text-gray-500 mt-2">잠시만 기다려주세요.</p>
          </div>
        </div>
      </div>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <div className="flex flex-col min-h-screen w-full bg-gray-50 sandol-font">
        <Header />
        <div className="container mx-auto max-w-md px-4 py-8">
          <div className="text-center">
            <p className="text-red-500 text-xl mb-4">{error}</p>
            <button
              onClick={handleGoBack}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              뒤로가기
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 데이터 없음
  if (!analysisData) {
    return (
      <div className="flex flex-col min-h-screen w-full bg-gray-50 sandol-font">
        <Header />
        <div className="container mx-auto max-w-md px-4 py-8">
          <div className="text-center">
            <p className="text-xl mb-4">분석 결과가 없습니다.</p>
            <button
              onClick={handleGoBack}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              뒤로가기
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen w-full bg-gray-50 sandol-font">
      <Header />

      <div className="container mx-auto max-w-md px-4 py-8">
        <div className="flex items-center mb-6">
          <button
            onClick={handleGoBack}
            className="text-blue-500 hover:underline flex items-center"
          >
            <span className="mr-1">←</span> 뒤로가기
          </button>
          <h1 className="text-2xl font-bold text-center flex-grow">
            분석 결과
          </h1>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold mb-4">
              {getAnalysisTypeText(analysisType)} 분석
            </h2>
          </div>

          {/* 분석된 이미지 표시 */}
          {(analysisData?.outputImagePath ||
            analysisData?.output_image_paths) && (
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">분석된 이미지</h3>
              {/* 기존 단일 이미지 */}
              {analysisData?.outputImagePath && (
                <div className="mb-4">
                  <img
                    src={`/${analysisData.outputImagePath}`}
                    alt="분석 이미지"
                    className="w-full rounded-lg shadow-sm"
                    onError={(e) => {
                      e.target.style.display = "none";
                      console.error(
                        "이미지 로드 실패:",
                        analysisData.outputImagePath
                      );
                    }}
                  />
                </div>
              )}
              {/* 새로운 multiple 이미지 구조 */}
              {analysisData?.output_image_paths && (
                <div className="space-y-4">
                  {analysisData.output_image_paths.stain && (
                    <div>
                      <p className="text-sm text-gray-600 mb-2">
                        얼룩 분석 이미지
                      </p>
                      <img
                        src={`/${analysisData.output_image_paths.stain}`}
                        alt="얼룩 분석 이미지"
                        className="w-full rounded-lg shadow-sm"
                        onError={(e) => {
                          e.target.style.display = "none";
                          console.error(
                            "얼룩 이미지 로드 실패:",
                            analysisData.output_image_paths.stain
                          );
                        }}
                      />
                    </div>
                  )}
                  {analysisData.output_image_paths.label && (
                    <div>
                      <p className="text-sm text-gray-600 mb-2">
                        라벨 분석 이미지
                      </p>
                      <img
                        src={`/${analysisData.output_image_paths.label}`}
                        alt="라벨 분석 이미지"
                        className="w-full rounded-lg shadow-sm"
                        onError={(e) => {
                          e.target.style.display = "none";
                          console.error(
                            "라벨 이미지 로드 실패:",
                            analysisData.output_image_paths.label
                          );
                        }}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* 분석 결과 */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-4">분석 결과</h3>

            {/* Stain 타입인 경우 얼룩 결과 표시 */}
            {analysisType === "stain" && analysisData && (
              <>
                {analysisData.types &&
                  analysisData.types.map((stainType, index) => {
                    const instructions =
                      analysisData.instructionsMap[stainType] || [];
                    const stainInstructions =
                      instructions.length > 0 && instructions[0].description
                        ? instructions[0].description
                            .split("\n")
                            .filter((inst) => inst.trim())
                        : [
                            `${stainType} 얼룩에 대한 세탁 방법 정보가 없습니다.`,
                          ];

                    // 해당 얼룩의 신뢰도 찾기
                    const detectedStain = analysisData.detectedStains
                      ? analysisData.detectedStains.find(
                          (s) => s.class === stainType
                        )
                      : null;

                    return renderStainResultSection(
                      `${index + 1}번째로 확인된 얼룩`,
                      stainType,
                      stainInstructions,
                      detectedStain?.confidence,
                      index
                    );
                  })}

                {/* 전체 감지된 얼룩 정보 표시 (중복 제거 전) */}
                {analysisData.detectedStains &&
                  analysisData.detectedStains.length > 0 && (
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                      <h4 className="text-md font-medium mb-3 text-blue-800">
                        🔍 감지된 모든 얼룩 정보
                      </h4>
                      <div className="space-y-2">
                        {analysisData.detectedStains.map((stain, index) => (
                          <div
                            key={index}
                            className="flex justify-between items-center text-sm"
                          >
                            <span className="text-gray-700">{stain.class}</span>
                            <span className="text-blue-600 font-semibold">
                              {(stain.confidence * 100).toFixed(1)}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
              </>
            )}

            {/* Label 타입인 경우 라벨 결과 표시 */}
            {analysisType === "label" && analysisData && (
              <>
                {renderLabelResultSection(
                  "감지된 세탁 기호",
                  analysisData.methods
                )}
              </>
            )}

            {/* Both 타입인 경우 얼룩과 라벨 결과 모두 표시 */}
            {analysisType === "both" && analysisData && (
            <>
              {/* AI 생성 종합 가이드 */}
                {analysisData.llm_generated_guide && (
                  <div className="mt-4 p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-600 mb-2 font-medium">
                      🤖 AI 추천 종합 세탁 가이드
                    </p>
                    <p className="text-gray-700 text-sm whitespace-pre-line">
                      {analysisData.llm_generated_guide}
                    </p>
                  </div>
                )}
              {/* 최고 확률 얼룩 결과 */}
              {analysisData.top1_stain && (
                <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">감지된 얼룩</p>
                  <div className="flex items-center mb-2">
                    <p className="text-gray-800 font-semibold">
                      💧 {analysisData.top1_stain}
                    </p>
                  </div>
                  <p className="text-gray-700 text-sm whitespace-pre-line">
                    {analysisData.washing_instruction}
                  </p>
                </div>
              )}

              {/* 감지된 라벨 결과 */}
              {analysisData.methods && analysisData.methods.length > 0 && (
                <>
                  <div className="mb-4 mt-6">
                    <h4 className="text-md font-semibold mb-2 text-gray-800">
                      감지된 세탁 심볼
                    </h4>
                    {renderLabelResultSection("감지된 세탁 기호", analysisData.methods)}
                  </div>
                </>
              )}
            </>
          )}


            {/* 결과가 없는 경우 */}
            {analysisType === "stain" &&
              (!analysisData.types || analysisData.types.length === 0) && (
                <div className="text-center py-8">
                  <p className="text-gray-500">감지된 얼룩이 없습니다.</p>
                  <p className="text-sm text-gray-400 mt-2">
                    이미지를 다시 확인하거나 더 선명한 사진으로 다시
                    시도해보세요.
                  </p>
                </div>
              )}

            {analysisType === "label" &&
              (!analysisData.methods || analysisData.methods.length === 0) && (
                <div className="text-center py-8">
                  <p className="text-gray-500">감지된 라벨이 없습니다.</p>
                  <p className="text-sm text-gray-400 mt-2">
                    라벨이 더 선명하게 보이는 사진으로 다시 시도해보세요.
                  </p>
                </div>
              )}
          </div>

          {/* 다시 분석하기 버튼 */}
          <div className="mt-8">
            <button
              onClick={handleGoBack}
              className="w-full py-3 bg-blue-500 text-white rounded-md font-medium hover:bg-blue-600 transition-colors"
            >
              다시 분석하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisResultPage;
