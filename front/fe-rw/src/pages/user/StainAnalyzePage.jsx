import React, { useState, useRef } from "react";
import Header from "../../components/common/Header";
import { ANALYSIS_API, PROXY_API } from "../../constants/api";
import axios from "axios";
import { useNavigate } from "react-router-dom";


const StainAnalyzePage = () => {
  // 파일 입력 요소에 대한 참조 생성
  const stainFileInputRef = useRef(null);
  const stainCameraInputRef = useRef(null);
  const navigate = useNavigate();
  const [stainFile, setStainFile] = useState(null);
  const [loading, setLoading] = useState(false);

  //API URL 설정
  const ANALYSIS_URL = ANALYSIS_API.STAIN;
  
  // 업로드된 이미지 상태 관리
  const [stainImage, setStainImage] = useState(null);

  // 선택된 옵션 상태 관리
  const [stainSelectedOption, setStainSelectedOption] =
    useState("이미지 업로드 형식 선택");

  // 이미지 업로드 핸들러
  const handleStainImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setStainImage(URL.createObjectURL(file)); // 미리보기용
      setStainFile(file); // 실제 API용
      setStainSelectedOption(
        e.target.accept.includes("image")
          ? "파일 선택"
          : "사진 또는 비디오 찍기"
      );
    }
  };
  const handleStainAnalysis = async () => {
  if (!stainFile) {
    alert("얼룩 이미지를 업로드해주세요.");
    return;
  }

  setLoading(true);

  const formData = new FormData();
  formData.append("file", stainFile);

  try {
    const token = localStorage.getItem("accessToken");
    const response = await axios.post(
      ANALYSIS_URL,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: token ? `Bearer ${token}` : "",
        },
      }
    );

    if (response.data.success) {
      const result = response.data.data;

      const uniqueStainTypes = [
        ...new Set(result.detected_stain.top3.map((s) => s.class)),
      ];

      const instructionsMap = {};
      uniqueStainTypes.forEach((stain) => {
        const matchingInstructions = result.washing_instructions
          .filter((w) => w.class === stain)
          .map((w) => ({
            title: stain,
            description: w.instruction,
          }));
        instructionsMap[stain] = matchingInstructions;
      });

      navigate(`/analyze/result/stain`, {
        state: {
          analysisType: "stain",
          analysisData: {
            types: uniqueStainTypes,
            instructionsMap: instructionsMap,
          },
        },
      });
    } else {
      alert(response.data.error?.message || "분석에 실패했습니다.");
      // 🔁 분석 실패 시 초기화
      setStainFile(null);
      setStainImage(null);
      setStainSelectedOption("이미지 업로드 형식 선택");
    }
  } catch (err) {
    console.error("분석 요청 실패:", err);

    const errorMessage =
      err.response?.data?.error?.message || "서버 오류로 분석에 실패했습니다.";

    alert(errorMessage);

    // 상태 초기화
    setStainFile(null);
    setStainImage(null);
    setStainSelectedOption("이미지 업로드 형식 선택");

    // 새로고침
    window.location.reload();
  }
};


  // 옵션 변경 시 실행할 동작
  const handleStainOptionChange = (e) => {
    const option = e.target.value;
    setStainSelectedOption(option);

    // 선택한 옵션에 따라 즉시 동작 수행
    if (option === "사진 보관함") {
      // 사진 보관함 열기 (파일 선택 다이얼로그와 유사)
      stainFileInputRef.current.click();
    } else if (option === "사진 또는 비디오 찍기") {
      // 카메라 열기
      stainCameraInputRef.current.click();
    } else if (option === "파일 선택") {
      // 파일 선택 다이얼로그 열기
      stainFileInputRef.current.click();
    }
  };

  return (
    <div className="flex flex-col min-h-screen w-full bg-gray-50 sandol-font">
      <Header />

      <div className="container mx-auto max-w-md px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-6">얼룩 분석</h1>

        {/* 이미지 업로드 섹션 (얼룩) */}
        <div className="mb-6 text-2xl">
          <p className="mb-2">얼룩 이미지를 업로드하세요</p>
          <div className="relative">
            <select
              className="w-full p-3 border rounded-md appearance-none bg-white pr-8"
              value={stainSelectedOption}
              onChange={handleStainOptionChange}
            >
              <option value="이미지 업로드 형식 선택">
                이미지 업로드 형식 선택
              </option>
              <option value="사진 보관함">사진 보관함</option>
              <option value="사진 또는 비디오 찍기">
                사진 또는 비디오 찍기
              </option>
              <option value="파일 선택">파일 선택</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg
                className="h-5 w-5 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>

          {/* 실제 파일 업로드 input (화면에는 보이지 않음) */}
          <input
            type="file"
            accept="image/*"
            onChange={handleStainImageUpload}
            className="hidden"
            ref={stainFileInputRef}
          />

          {/* 카메라 input (화면에는 보이지 않음) */}
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleStainImageUpload}
            className="hidden"
            ref={stainCameraInputRef}
          />

          {/* 업로드된 이미지 미리보기 */}
          {stainImage && (
            <div className="mt-3">
              <img
                src={stainImage}
                alt="얼룩 이미지"
                className="w-full h-auto rounded-md border"
              />
            </div>
          )}
        </div>

        {/* 분석 버튼 */}
      <div className="mt-10">
        <button
          className="w-full py-3 bg-sky-200 rounded-md text-2xl font-medium disabled:opacity-50"
          onClick={handleStainAnalysis}
          disabled={loading} // 🔹 로딩 중엔 버튼 비활성화
        >
          {loading ? "분석 중..." : "분석하기"}
        </button>

        {/* 로딩 메시지 */}
        {loading && (
          <p className="text-center mt-3 text-gray-500 text-lg">잠시만 기다려주세요. 분석 중입니다...</p>
        )}
      </div>
      </div>
    </div>
  );
};

export default StainAnalyzePage;
