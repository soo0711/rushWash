import React, { useState, useEffect } from "react";
import Header from "../../components/common/Header";
import { useLocation, useNavigate } from "react-router-dom";
import { ANALYSIS_API } from "../../constants/api";
import axios from "axios";

const AnalysisResultPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { analysisType, files } = location.state || {};

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [analysisData, setAnalysisData] = useState(null);

  // API 호출 함수
  const fetchAnalysisResult = async () => {
    if (!files || !analysisType) {
      setError("분석할 파일이 없습니다.");
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

        // 분석 타입에 따라 데이터 처리
        if (analysisType === "stain") {
          const uniqueStainTypes = [
            ...new Set(result.detected_stain.top3.map((s) => s.class)),
          ];

          const instructionsMap = {};
          uniqueStainTypes.forEach((stain) => {
            const matchingInstructions = result.washing_instructions
              .filter((w) => w.class === stain)
              .map((w) => ({
                title: stain,
                description: w.instructions.join("\n"),
              }));
            instructionsMap[stain] = matchingInstructions;
          });

          setAnalysisData({
            types: uniqueStainTypes,
            instructionsMap: instructionsMap,
            outputImagePath: result.output_image_path, // 이미지 경로 추가
          });
        } else if (analysisType === "label") {
          const detectedLabels = result.detected_labels || [];
          const labelExplanation = result.label_explanation || [];

          const methods = detectedLabels.map((label, index) => ({
            title: label,
            description: labelExplanation[index] || "",
          }));

          setAnalysisData({
            type: "라벨 분석 결과",
            methods,
            outputImagePath: result.output_image_path, // 이미지 경로 추가
          });
        } else if (analysisType === "both") {
          // both 타입의 경우 서버 응답 구조에 따라 조정 필요
          setAnalysisData(result);
        }
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

  useEffect(() => {
    fetchAnalysisResult();
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
  const renderStainResultSection = (title, stainType, instructions, index) => (
    <div key={`stain-${index}`} className="mb-4 p-4 bg-gray-50 rounded-lg">
      <p className="text-sm text-gray-500 mb-1">{title}</p>
      <p className="text-gray-800 font-semibold mb-2">💧 {stainType}</p>
      <div className="space-y-2">
        {instructions.map((instruction, instrIndex) => (
          <p key={instrIndex} className="text-gray-700 text-sm">
            • {instruction}
          </p>
        ))}
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
              className="text-blue-500 hover:underline"
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
              className="text-blue-500 hover:underline"
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
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">분석된 이미지</h3>
            {analysisType === "stain" && analysisData?.outputImagePath && (
              <div className="mb-4">
                <img
                  src={analysisData.outputImagePath}
                  alt="얼룩 분석 이미지"
                  className="w-full rounded-lg shadow-sm"
                />
              </div>
            )}

            {analysisType === "label" && analysisData?.outputImagePath && (
              <div className="mb-4">
                <img
                  src={analysisData.outputImagePath}
                  alt="라벨 분석 이미지"
                  className="w-full rounded-lg shadow-sm"
                />
              </div>
            )}

            {analysisType === "both" && analysisData && (
              <div className="space-y-4">
                {analysisData.stain?.outputImagePath && (
                  <div>
                    <p className="text-sm text-gray-500 mb-2">
                      얼룩 분석 이미지
                    </p>
                    <img
                      src={analysisData.stain.outputImagePath}
                      alt="얼룩 분석 이미지"
                      className="w-full rounded-lg shadow-sm"
                    />
                  </div>
                )}
                {analysisData.label?.outputImagePath && (
                  <div>
                    <p className="text-sm text-gray-500 mb-2">
                      라벨 분석 이미지
                    </p>
                    <img
                      src={analysisData.label.outputImagePath}
                      alt="라벨 분석 이미지"
                      className="w-full rounded-lg shadow-sm"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 분석 결과 */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-4">분석 결과</h3>

            {/* Both 타입인 경우 얼룩과 라벨 결과 모두 표시 */}
            {analysisType === "both" && analysisData && (
              <>
                {/* 얼룩 분석 결과 */}
                {analysisData.stain &&
                  analysisData.stain.types &&
                  analysisData.stain.types.map((stainType, index) => {
                    const instructions =
                      analysisData.stain.instructionsMap[stainType] || [];
                    const stainInstructions =
                      instructions.length > 0 && instructions[0].description
                        ? instructions[0].description
                            .split("\n")
                            .filter((inst) => inst.trim())
                        : [];

                    return renderStainResultSection(
                      `${index + 1}번째로 확인된 얼룩`,
                      stainType,
                      stainInstructions,
                      index
                    );
                  })}

                {/* 라벨 분석 결과 */}
                {analysisData.label &&
                  renderLabelResultSection(
                    "라벨의 재질",
                    analysisData.label.methods
                  )}
              </>
            )}

            {/* Label 타입인 경우 라벨 결과만 표시 */}
            {analysisType === "label" &&
              analysisData &&
              renderLabelResultSection("라벨의 재질", analysisData.methods)}

            {/* Stain 타입인 경우 얼룩 결과만 표시 */}
            {analysisType === "stain" &&
              analysisData &&
              analysisData.types &&
              analysisData.types.map((stainType, index) => {
                const instructions =
                  analysisData.instructionsMap[stainType] || [];
                const stainInstructions =
                  instructions.length > 0 && instructions[0].description
                    ? instructions[0].description
                        .split("\n")
                        .filter((inst) => inst.trim())
                    : [];

                return renderStainResultSection(
                  `${index + 1}번째로 확인된 얼룩`,
                  stainType,
                  stainInstructions,
                  index
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisResultPage;
