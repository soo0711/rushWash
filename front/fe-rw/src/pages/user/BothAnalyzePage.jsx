import React, { useState, useRef, useEffect } from "react";
import Header from "../../components/common/Header";
import { ANALYSIS_API } from "../../constants/api";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const BothAnalyzePage = () => {
  const stainFileInputRef = useRef(null);
  const labelFileInputRef = useRef(null);
  const stainGalleryInputRef = useRef(null); // 얼룩 갤러리용 추가
  const labelGalleryInputRef = useRef(null); // 라벨 갤러리용 추가
  const navigate = useNavigate();

  // 얼룩 분석용 웹캠 요소들
  const stainVideoRef = useRef(null);
  const stainCanvasRef = useRef(null);

  // 라벨 분석용 웹캠 요소들
  const labelVideoRef = useRef(null);
  const labelCanvasRef = useRef(null);

  const [stainFile, setStainFile] = useState(null);
  const [labelFile, setLabelFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [stainImage, setStainImage] = useState(null);
  const [labelImage, setLabelImage] = useState(null);
  const [stainSelectedOption, setStainSelectedOption] =
    useState("이미지 업로드 형식 선택");
  const [labelSelectedOption, setLabelSelectedOption] =
    useState("이미지 업로드 형식 선택");

  // 웹캠 상태 - 각각 독립적으로 관리
  const [stainUseWebcam, setStainUseWebcam] = useState(false);
  const [labelUseWebcam, setLabelUseWebcam] = useState(false);
  const [stainCameraReady, setStainCameraReady] = useState(false);
  const [labelCameraReady, setLabelCameraReady] = useState(false);

  // 얼룩용 웹캠 시작
  const startStainWebcam = async () => {
    console.log("얼룩 카메라 시작 시도...");

    if (
      window.location.protocol !== "https:" &&
      window.location.hostname !== "localhost"
    ) {
      alert("카메라 기능은 HTTPS 환경에서만 사용할 수 있습니다.");
      return;
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert("이 브라우저는 카메라 기능을 지원하지 않습니다.");
      return;
    }

    setStainUseWebcam(true);
    setStainCameraReady(false);
    setStainImage(null);
    setStainFile(null);

    setTimeout(async () => {
      try {
        if (!stainVideoRef.current) {
          console.error("stainVideoRef.current가 여전히 null입니다");
          setStainUseWebcam(false);
          return;
        }

        let stream;
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: "environment",
              width: { ideal: 1280 },
              height: { ideal: 720 },
            },
          });
        } catch (err) {
          console.log("후면 카메라 실패, 기본 카메라로 시도...");
          stream = await navigator.mediaDevices.getUserMedia({
            video: {
              width: { ideal: 1280 },
              height: { ideal: 720 },
            },
          });
        }

        console.log("얼룩 카메라 스트림 획득 성공:", stream);

        stainVideoRef.current.srcObject = stream;

        stainVideoRef.current.onloadedmetadata = () => {
          console.log("얼룩 비디오 메타데이터 로드됨");
          setStainCameraReady(true);
        };

        stainVideoRef.current.oncanplay = () => {
          console.log("얼룩 비디오 재생 준비됨");
          setStainCameraReady(true);
        };

        try {
          await stainVideoRef.current.play();
        } catch (playErr) {
          console.warn("얼룩 비디오 자동 재생 실패:", playErr);
        }
      } catch (err) {
        console.error("얼룩 웹캠 접근 실패:", err);
        let errorMessage = "카메라에 접근할 수 없습니다.";

        if (err.name === "NotAllowedError") {
          errorMessage =
            "카메라 권한이 거부되었습니다. 브라우저 설정에서 카메라 권한을 허용해주세요.";
        } else if (err.name === "NotFoundError") {
          errorMessage = "카메라를 찾을 수 없습니다.";
        } else if (err.name === "NotSupportedError") {
          errorMessage = "이 브라우저는 카메라 기능을 지원하지 않습니다.";
        }

        alert(errorMessage);
        setStainUseWebcam(false);
        setStainCameraReady(false);
      }
    }, 100);
  };

  // 라벨용 웹캠 시작
  const startLabelWebcam = async () => {
    console.log("라벨 카메라 시작 시도...");

    if (
      window.location.protocol !== "https:" &&
      window.location.hostname !== "localhost"
    ) {
      alert("카메라 기능은 HTTPS 환경에서만 사용할 수 있습니다.");
      return;
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert("이 브라우저는 카메라 기능을 지원하지 않습니다.");
      return;
    }

    setLabelUseWebcam(true);
    setLabelCameraReady(false);
    setLabelImage(null);
    setLabelFile(null);

    setTimeout(async () => {
      try {
        if (!labelVideoRef.current) {
          console.error("labelVideoRef.current가 여전히 null입니다");
          setLabelUseWebcam(false);
          return;
        }

        let stream;
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: "environment",
              width: { ideal: 1280 },
              height: { ideal: 720 },
            },
          });
        } catch (err) {
          console.log("후면 카메라 실패, 기본 카메라로 시도...");
          stream = await navigator.mediaDevices.getUserMedia({
            video: {
              width: { ideal: 1280 },
              height: { ideal: 720 },
            },
          });
        }

        console.log("라벨 카메라 스트림 획득 성공:", stream);

        labelVideoRef.current.srcObject = stream;

        labelVideoRef.current.onloadedmetadata = () => {
          console.log("라벨 비디오 메타데이터 로드됨");
          setLabelCameraReady(true);
        };

        labelVideoRef.current.oncanplay = () => {
          console.log("라벨 비디오 재생 준비됨");
          setLabelCameraReady(true);
        };

        try {
          await labelVideoRef.current.play();
        } catch (playErr) {
          console.warn("라벨 비디오 자동 재생 실패:", playErr);
        }
      } catch (err) {
        console.error("라벨 웹캠 접근 실패:", err);
        let errorMessage = "카메라에 접근할 수 없습니다.";

        if (err.name === "NotAllowedError") {
          errorMessage =
            "카메라 권한이 거부되었습니다. 브라우저 설정에서 카메라 권한을 허용해주세요.";
        } else if (err.name === "NotFoundError") {
          errorMessage = "카메라를 찾을 수 없습니다.";
        } else if (err.name === "NotSupportedError") {
          errorMessage = "이 브라우저는 카메라 기능을 지원하지 않습니다.";
        }

        alert(errorMessage);
        setLabelUseWebcam(false);
        setLabelCameraReady(false);
      }
    }, 100);
  };

  // 얼룩용 웹캠 정지
  const stopStainWebcam = () => {
    if (stainVideoRef.current && stainVideoRef.current.srcObject) {
      const tracks = stainVideoRef.current.srcObject.getTracks();
      tracks.forEach((track) => track.stop());
      stainVideoRef.current.srcObject = null;
    }
    setStainUseWebcam(false);
    setStainCameraReady(false);
  };

  // 라벨용 웹캠 정지
  const stopLabelWebcam = () => {
    if (labelVideoRef.current && labelVideoRef.current.srcObject) {
      const tracks = labelVideoRef.current.srcObject.getTracks();
      tracks.forEach((track) => track.stop());
      labelVideoRef.current.srcObject = null;
    }
    setLabelUseWebcam(false);
    setLabelCameraReady(false);
  };

  // 얼룩 사진 촬영
  const captureStainPhoto = () => {
    if (
      !stainVideoRef.current ||
      !stainCanvasRef.current ||
      !stainCameraReady
    ) {
      alert("카메라가 준비되지 않았습니다.");
      return;
    }

    const canvas = stainCanvasRef.current;
    const video = stainVideoRef.current;

    if (video.videoWidth === 0 || video.videoHeight === 0) {
      alert("카메라가 아직 준비되지 않았습니다. 잠시 후 다시 시도해주세요.");
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0);

    canvas.toBlob(
      (blob) => {
        if (blob) {
          const file = new File([blob], "stain-camera-photo.jpg", {
            type: "image/jpeg",
          });
          setStainFile(file);
          setStainImage(URL.createObjectURL(blob));
          stopStainWebcam();
          setStainSelectedOption("사진 찍기");
        }
      },
      "image/jpeg",
      0.8
    );
  };

  // 라벨 사진 촬영
  const captureLabelPhoto = () => {
    if (
      !labelVideoRef.current ||
      !labelCanvasRef.current ||
      !labelCameraReady
    ) {
      alert("카메라가 준비되지 않았습니다.");
      return;
    }

    const canvas = labelCanvasRef.current;
    const video = labelVideoRef.current;

    if (video.videoWidth === 0 || video.videoHeight === 0) {
      alert("카메라가 아직 준비되지 않았습니다. 잠시 후 다시 시도해주세요.");
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0);

    canvas.toBlob(
      (blob) => {
        if (blob) {
          const file = new File([blob], "label-camera-photo.jpg", {
            type: "image/jpeg",
          });
          setLabelFile(file);
          setLabelImage(URL.createObjectURL(blob));
          stopLabelWebcam();
          setLabelSelectedOption("사진 찍기");
        }
      },
      "image/jpeg",
      0.8
    );
  };

  const handleStainImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setStainImage(URL.createObjectURL(file));
      setStainFile(file);
      setStainSelectedOption("파일 선택");
    }
  };

  const handleLabelImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLabelImage(URL.createObjectURL(file));
      setLabelFile(file);
      setLabelSelectedOption("파일 선택");
    }
  };

  const handleLabelOptionChange = (e) => {
    const option = e.target.value;
    setLabelSelectedOption(option);

    if (labelUseWebcam) {
      stopLabelWebcam();
    }

    if (option === "사진 보관함" || option === "파일 선택") {
      setLabelImage(null);
      setLabelFile(null);

      // input 초기화만, 자동 클릭 제거
      if (labelFileInputRef.current) {
        labelFileInputRef.current.value = "";
      }
      if (labelGalleryInputRef.current) {
        labelGalleryInputRef.current.value = "";
      }
    } else if (option === "사진 찍기") {
      if (
        window.location.protocol !== "https:" &&
        window.location.hostname !== "localhost"
      ) {
        alert(
          'HTTP 환경에서는 직접 카메라 촬영이 불가능합니다.\n"사진 보관함"을 선택하여 촬영된 사진을 업로드해주세요.'
        );
        setLabelSelectedOption("이미지 업로드 형식 선택");
        return;
      }
      // 웹캠은 버튼에서 시작
    } else if (option === "이미지 업로드 형식 선택") {
      setLabelImage(null);
      setLabelFile(null);
    }
  };

  const handleStainOptionChange = (e) => {
    const option = e.target.value;
    setStainSelectedOption(option);

    if (stainUseWebcam) {
      stopStainWebcam();
    }

    if (option === "사진 보관함" || option === "파일 선택") {
      setStainImage(null);
      setStainFile(null);

      // input 초기화만, 자동 클릭 제거
      if (stainFileInputRef.current) {
        stainFileInputRef.current.value = "";
      }
      if (stainGalleryInputRef.current) {
        stainGalleryInputRef.current.value = "";
      }
    } else if (option === "사진 찍기") {
      if (
        window.location.protocol !== "https:" &&
        window.location.hostname !== "localhost"
      ) {
        alert(
          'HTTP 환경에서는 직접 카메라 촬영이 불가능합니다.\n"사진 보관함"을 선택하여 촬영된 사진을 업로드해주세요.'
        );
        setStainSelectedOption("이미지 업로드 형식 선택");
        return;
      }
      // 웹캠은 버튼에서 시작
    } else if (option === "이미지 업로드 형식 선택") {
      setStainImage(null);
      setStainFile(null);
    }
  };

  const handleBothAnalysis = async () => {
    if (!stainFile || !labelFile) {
      alert("얼룩과 라벨 이미지를 모두 업로드해주세요.");
      return;
    }

    setLoading(true);


    try {
      // 하나의 FormData에 두 파일 모두 추가
      const formData = new FormData();
      formData.append("stainFile", stainFile);
      formData.append("labelFile", labelFile);

      const token = localStorage.getItem("accessToken");
      const headers = {
        "Content-Type": "multipart/form-data",
        Authorization: token ? `Bearer ${token}` : "",
      };

      // 단일 API 호출 (ANALYSIS_API.STAIN_LABEL)
      const response = await axios.post(ANALYSIS_API.STAIN_LABEL, formData, { headers });

      if (response.data.success) {
        const result = response.data.data;

        // 얼룩 결과 처리
        const stainResult = result.stainAnalysis;
        const uniqueStainTypes = [
          ...new Set(stainResult.detected_stain.top3.map((s) => s.class)),
        ];

        const stainInstructionsMap = {};
        uniqueStainTypes.forEach((stain) => {
          const matchingInstructions = stainResult.washing_instructions
            .filter((w) => w.class === stain)
            .map((w) => ({
              title: stain,
              description: w.instruction,
            }));
          stainInstructionsMap[stain] = matchingInstructions;
        });

        // 라벨 결과 처리
        const labelResult = result.labelAnalysis;
        const detectedLabels = labelResult.detected_labels || [];
        const labelExplanation = labelResult.label_explanation || [];

        const labelMethods = detectedLabels.map((label, index) => ({
          title: label,
          description: labelExplanation[index] || "",
        }));

        navigate(`/analyze/result/both`, {
          state: {
            analysisType: "both",
            analysisData: {
              stain: {
                types: uniqueStainTypes,
                instructionsMap: stainInstructionsMap,
              },
              label: {
                type: "라벨 분석 결과",
                methods: labelMethods,
              },
            },
          },
        });
      } else {
        const errorMessage = response.data.error?.message || "분석에 실패했습니다.";
        alert(`분석 실패: ${errorMessage}`);

        setStainFile(null);
        setStainImage(null);
        setStainSelectedOption("이미지 업로드 형식 선택");
        setLabelFile(null);
        setLabelImage(null);
        setLabelSelectedOption("이미지 업로드 형식 선택");
      }
    } catch (err) {
      console.error("분석 요청 실패:", err);
      const errorMessage =
        err.response?.data?.error?.message ||
        "서버 오류로 분석에 실패했습니다.";
      alert(errorMessage);

      setStainFile(null);
      setStainImage(null);
      setStainSelectedOption("이미지 업로드 형식 선택");
      setLabelFile(null);
      setLabelImage(null);
      setLabelSelectedOption("이미지 업로드 형식 선택");
      window.location.reload();
    } finally {
      setLoading(false);
    }
  };

  // 컴포넌트 언마운트 시 웹캠 정리
  useEffect(() => {
    return () => {
      stopStainWebcam();
      stopLabelWebcam();
    };
  }, []);

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
              <option value="사진 보관함">사진 보관함에서 선택</option>
              <option value="사진 찍기">사진 찍기 (HTTPS 환경 필요)</option>
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

          {/* 얼룩 사진 찍기용 input - capture 있음 */}
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleStainImageUpload}
            className="hidden"
            ref={stainFileInputRef}
          />

          {/* 얼룩 갤러리용 input - capture 없음 */}
          <input
            type="file"
            accept="image/*"
            onChange={handleStainImageUpload}
            className="hidden"
            ref={stainGalleryInputRef}
          />

          {/* 얼룩 사진 찍기 버튼 */}
          {stainSelectedOption === "사진 찍기" &&
            !stainImage &&
            !stainUseWebcam && (
              <div className="mt-4">
                <button
                  onClick={() => {
                    if (stainFileInputRef.current) {
                      stainFileInputRef.current.click();
                    }
                  }}
                  disabled={loading}
                  className="w-full py-3 bg-blue-500 text-white rounded-md font-medium disabled:bg-gray-400 transition-colors"
                >
                  📱 사진 직접 찍기
                </button>
              </div>
            )}

          {/* 얼룩 사진 보관함 버튼 */}
          {stainSelectedOption === "사진 보관함" &&
            !stainImage &&
            !stainUseWebcam && (
              <div className="mt-4">
                <button
                  onClick={() => {
                    if (stainGalleryInputRef.current) {
                      stainGalleryInputRef.current.click();
                    }
                  }}
                  disabled={loading}
                  className="w-full py-3 bg-blue-500 text-white rounded-md font-medium disabled:bg-gray-400 transition-colors"
                >
                  📱 모바일 사진 업로드 방식 선택
                </button>
              </div>
            )}

          {/* 얼룩용 웹캠 화면 */}
          {stainUseWebcam && (
            <div className="mt-4 relative">
              <p className="text-sm text-gray-600 mb-2">
                {!stainCameraReady ? "카메라 로딩 중..." : "카메라 준비됨"}
              </p>
              <video
                ref={stainVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full rounded-md border bg-gray-100"
                style={{ maxHeight: "400px" }}
              />
              <canvas ref={stainCanvasRef} className="hidden" />
              <div className="flex gap-2 mt-3">
                <button
                  onClick={captureStainPhoto}
                  disabled={!stainCameraReady}
                  className="flex-1 py-2 bg-blue-500 text-white rounded-md font-medium disabled:bg-gray-400"
                >
                  📸 {stainCameraReady ? "촬영" : "준비 중..."}
                </button>
                <button
                  onClick={stopStainWebcam}
                  className="flex-1 py-2 bg-gray-500 text-white rounded-md font-medium"
                >
                  취소
                </button>
              </div>
            </div>
          )}

          {stainImage && !stainUseWebcam && (
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
              <option value="사진 보관함">사진 보관함에서 선택</option>
              <option value="사진 찍기">사진 찍기 (HTTPS 환경 필요)</option>
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

          {/* 라벨 사진 찍기용 input - capture 있음 */}
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleLabelImageUpload}
            className="hidden"
            ref={labelFileInputRef}
          />

          {/* 라벨 갤러리용 input - capture 없음 */}
          <input
            type="file"
            accept="image/*"
            onChange={handleLabelImageUpload}
            className="hidden"
            ref={labelGalleryInputRef}
          />

          {/* 라벨 사진 찍기 버튼 */}
          {labelSelectedOption === "사진 찍기" &&
            !labelImage &&
            !labelUseWebcam && (
              <div className="mt-4">
                <button
                  onClick={() => {
                    if (labelFileInputRef.current) {
                      labelFileInputRef.current.click();
                    }
                  }}
                  disabled={loading}
                  className="w-full py-3 bg-blue-500 text-white rounded-md font-medium disabled:bg-gray-400 transition-colors"
                >
                  📱 사진 직접 찍기
                </button>
              </div>
            )}

          {/* 라벨 사진 보관함 버튼 */}
          {labelSelectedOption === "사진 보관함" &&
            !labelImage &&
            !labelUseWebcam && (
              <div className="mt-4">
                <button
                  onClick={() => {
                    if (labelGalleryInputRef.current) {
                      labelGalleryInputRef.current.click();
                    }
                  }}
                  disabled={loading}
                  className="w-full py-3 bg-blue-500 text-white rounded-md font-medium disabled:bg-gray-400 transition-colors"
                >
                  📱 모바일 사진 업로드 방식 선택
                </button>
              </div>
            )}

          {/* 라벨용 웹캠 화면 */}
          {labelUseWebcam && (
            <div className="mt-4 relative">
              <p className="text-sm text-gray-600 mb-2">
                {!labelCameraReady ? "카메라 로딩 중..." : "카메라 준비됨"}
              </p>
              <video
                ref={labelVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full rounded-md border bg-gray-100"
                style={{ maxHeight: "400px" }}
              />
              <canvas ref={labelCanvasRef} className="hidden" />
              <div className="flex gap-2 mt-3">
                <button
                  onClick={captureLabelPhoto}
                  disabled={!labelCameraReady}
                  className="flex-1 py-2 bg-blue-500 text-white rounded-md font-medium disabled:bg-gray-400"
                >
                  📸 {labelCameraReady ? "촬영" : "준비 중..."}
                </button>
                <button
                  onClick={stopLabelWebcam}
                  className="flex-1 py-2 bg-gray-500 text-white rounded-md font-medium"
                >
                  취소
                </button>
              </div>
            </div>
          )}

          {labelImage && !labelUseWebcam && (
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
            className="w-full py-3 bg-sky-200 rounded-md text-2xl font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:bg-sky-300"
            onClick={handleBothAnalysis}
            disabled={loading || !stainFile || !labelFile}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-600 mr-2"></div>
                분석 중...
              </div>
            ) : (
              "분석하기"
            )}
          </button>

          {loading && (
            <div className="text-center mt-3">
              <p className="text-gray-500 text-lg mb-2">
                잠시만 기다려주세요. 분석 중입니다...
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full animate-pulse"
                  style={{ width: "60%" }}
                ></div>
              </div>
            </div>
          )}

          {/* 도움말 */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-sm font-medium text-blue-800 mb-2">
              💡 더 나은 분석을 위한 팁
            </h3>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• 얼룩이나 라벨이 선명하게 보이는 사진을 선택하세요</li>
              <li>• 충분한 조명 아래에서 촬영하세요</li>
              <li>• 분석할 부분이 화면 중앙에 오도록 촬영하세요</li>
              <li>• 흔들리지 않게 안정적으로 촬영하세요</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BothAnalyzePage;
