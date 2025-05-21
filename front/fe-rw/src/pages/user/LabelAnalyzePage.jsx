import React, { useState, useRef } from "react";
import Header from "../../components/common/Header";
import { ANALYSIS_API, PROXY_API } from "../../constants/api";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const LabelAnalyzePage = () => {
  // 파일 입력 요소에 대한 참조 생성
  const labelFileInputRef = useRef(null);
  const labelCameraInputRef = useRef(null);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [labelFile, setLabelFile] = useState(null);

  //API URL 설정
  const ANALYSIS_URL = ANALYSIS_API.LABEL;

  // 업로드된 이미지 상태 관리
  const [labelImage, setLabelImage] = useState(null);

  // 선택된 옵션 상태 관리
  const [labelSelectedOption, setLabelSelectedOption] =
    useState("이미지 업로드 형식 선택");

  // 이미지 업로드 핸들러
  const handleLabelImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLabelImage(URL.createObjectURL(file)); // 미리보기용
      setLabelFile(file); // 실제 API용
      setLabelSelectedOption(
        e.target.accept.includes("image")
          ? "파일 선택"
          : "사진 또는 비디오 찍기"
      );
    }
  };

  const handleLabelAnalysis = async () => {
  if (!labelFile) {
    alert("라벨 이미지를 업로드해주세요.");
    return;
  }

  setLoading(true);

  const formData = new FormData();
  formData.append("file", labelFile);

  try {
    const token = localStorage.getItem("accessToken");
    const response = await axios.post(ANALYSIS_URL, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: token ? `Bearer ${token}` : "",
      },
    });

    if (response.data.success) {
      const result = response.data.data;
      const detectedLabels = result.detected_labels || [];
      const labelExplanation = result.label_explanation || [];

      const methods = detectedLabels.map((label, index) => ({
        title: label,
        description: labelExplanation[index] || "",
      }));

      navigate(`/analyze/result/label`, {
        state: {
          analysisType: "label",
          analysisData: {
            type: "라벨 분석 결과",
            methods,
          },
        },
      });
    } else {
      alert(response.data.error?.message || "분석에 실패했습니다.");
    }
  } catch (err) {
    console.error("분석 요청 실패:", err);
    alert("서버 오류로 분석에 실패했습니다.");
  } finally {
    setLoading(false);
  }
};

  // 옵션 변경 시 실행할 동작
  const handleLabelOptionChange = (e) => {
    const option = e.target.value;
    setLabelSelectedOption(option);

    // 선택한 옵션에 따라 즉시 동작 수행
    if (option === "사진 보관함") {
      // 사진 보관함 열기 (파일 선택 다이얼로그와 유사)
      labelFileInputRef.current.click();
    } else if (option === "사진 또는 비디오 찍기") {
      // 카메라 열기
      labelCameraInputRef.current.click();
    } else if (option === "파일 선택") {
      // 파일 선택 다이얼로그 열기
      labelFileInputRef.current.click();
    }
  };

  return (
    <div className="flex flex-col min-h-screen w-full bg-gray-50 sandol-font">
      <Header />

      <div className="container mx-auto max-w-md px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-6">라벨 분석</h1>

        {/* 이미지 업로드 섹션 (라벨) */}
        <div className="mb-6 text-2xl">
          <p className="mb-2">라벨 이미지를 업로드하세요</p>
          <div className="relative">
            <select
              className="w-full p-3 border rounded-md appearance-none bg-white pr-8"
              value={labelSelectedOption}
              onChange={handleLabelOptionChange}
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
            onChange={handleLabelImageUpload}
            className="hidden"
            ref={labelFileInputRef}
          />

          {/* 카메라 input (화면에는 보이지 않음) */}
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleLabelImageUpload}
            className="hidden"
            ref={labelCameraInputRef}
          />

          {/* 업로드된 이미지 미리보기 */}
          {labelImage && (
            <div className="mt-3">
              <img
                src={labelImage}
                alt="라벨 이미지"
                className="w-full h-auto rounded-md border"
              />
            </div>
          )}
        </div>

        {/* 분석 버튼 */}
        <div className="mt-10">
        <button
          className="w-full py-3 bg-sky-200 rounded-md text-2xl font-medium disabled:opacity-50"
          onClick={handleLabelAnalysis}
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

export default LabelAnalyzePage;
