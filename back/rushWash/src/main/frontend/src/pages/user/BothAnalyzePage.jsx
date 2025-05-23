import React, { useState, useRef } from "react";
import Header from "../../components/common/Header";
import { Link } from "react-router-dom";

const BothAnalyzePage = () => {
  // 파일 입력 요소에 대한 참조 생성
  const stainFileInputRef = useRef(null);
  const labelFileInputRef = useRef(null);
  const stainCameraInputRef = useRef(null);
  const labelCameraInputRef = useRef(null);

  // 업로드된 이미지 상태 관리
  const [stainImage, setStainImage] = useState(null);
  const [labelImage, setLabelImage] = useState(null);

  // 선택된 옵션 상태 관리
  const [stainSelectedOption, setStainSelectedOption] =
    useState("이미지 업로드 형식 선택");
  const [labelSelectedOption, setLabelSelectedOption] =
    useState("이미지 업로드 형식 선택");

  // 이미지 업로드 핸들러
  const handleStainImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // 이미지 미리보기를 위한 URL 생성
      setStainImage(URL.createObjectURL(file));
      // 성공적으로 이미지를 선택한 후, 드롭다운 값을 업데이트
      setStainSelectedOption(
        e.target.accept.includes("image")
          ? "파일 선택"
          : "사진 또는 비디오 찍기"
      );
    }
  };

  const handleLabelImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // 이미지 미리보기를 위한 URL 생성
      setLabelImage(URL.createObjectURL(file));
      // 성공적으로 이미지를 선택한 후, 드롭다운 값을 업데이트
      setLabelSelectedOption(
        e.target.accept.includes("image")
          ? "파일 선택"
          : "사진 또는 비디오 찍기"
      );
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
        <h1 className="text-4xl font-bold text-center mb-6">
          얼룩과 라벨 분석
        </h1>

        {/* 첫 번째 이미지 업로드 섹션 (얼룩) */}
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

        {/* 두 번째 이미지 업로드 섹션 (라벨) */}
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
            className="w-full py-3 bg-sky-200 rounded-md text-2xl font-medium"
            onClick={() => {
              // 이미지가 모두 선택되었는지 확인
              if (stainImage && labelImage) {
                // 실제로는 여기서 분석 로직을 실행하거나 다음 페이지로 이동
                alert("이미지 분석을 시작합니다!");
                // 필요한 경우 여기에 페이지 이동 로직 추가
                // navigate('/analyze/result');
              } else {
                alert("얼룩과 라벨 이미지를 모두 업로드해주세요.");
              }
            }}
          >
            분석하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default BothAnalyzePage;
