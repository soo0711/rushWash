import React, { useState, useRef, useEffect } from "react";
import Header from "../../components/common/Header";
import { ANALYSIS_API } from "../../constants/api";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const StainAnalyzePage = () => {
  const stainFileInputRef = useRef(null);
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  
  const [stainFile, setStainFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [stainImage, setStainImage] = useState(null);
  const [stainSelectedOption, setStainSelectedOption] = useState("이미지 업로드 형식 선택");
  const [useWebcam, setUseWebcam] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);

  const ANALYSIS_URL = ANALYSIS_API.STAIN;

  // 웹캠 시작
  const startWebcam = async () => {
    console.log("카메라 시작 시도...");
    
    // HTTPS 체크
    if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
      alert('카메라 기능은 HTTPS 환경에서만 사용할 수 있습니다.');
      return;
    }

    // 브라우저 지원 체크
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert('이 브라우저는 카메라 기능을 지원하지 않습니다.');
      return;
    }

    setUseWebcam(true);
    setCameraReady(false);
    // 기존 이미지 초기화
    setStainImage(null);
    setStainFile(null);

    // DOM 렌더링을 위한 약간의 지연
    setTimeout(async () => {
      try {
        if (!videoRef.current) {
          console.error("videoRef.current가 여전히 null입니다");
          setUseWebcam(false);
          return;
        }

        let stream;
        try {
          // 모바일에서 후면 카메라 우선 시도
          stream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
              facingMode: 'environment',
              width: { ideal: 1280 },
              height: { ideal: 720 }
            } 
          });
        } catch (err) {
          console.log("후면 카메라 실패, 기본 카메라로 시도...");
          stream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
              width: { ideal: 1280 },
              height: { ideal: 720 }
            } 
          });
        }
        
        console.log("카메라 스트림 획득 성공:", stream);
        
        videoRef.current.srcObject = stream;
        
        // 비디오가 준비될 때까지 대기
        videoRef.current.onloadedmetadata = () => {
          console.log("비디오 메타데이터 로드됨");
          setCameraReady(true);
        };

        videoRef.current.oncanplay = () => {
          console.log("비디오 재생 준비됨");
          setCameraReady(true);
        };

        // 재생 시작
        try {
          await videoRef.current.play();
        } catch (playErr) {
          console.warn("자동 재생 실패:", playErr);
        }

      } catch (err) {
        console.error("웹캠 접근 실패:", err);
        let errorMessage = "카메라에 접근할 수 없습니다.";
        
        if (err.name === 'NotAllowedError') {
          errorMessage = "카메라 권한이 거부되었습니다. 브라우저 설정에서 카메라 권한을 허용해주세요.";
        } else if (err.name === 'NotFoundError') {
          errorMessage = "카메라를 찾을 수 없습니다.";
        } else if (err.name === 'NotSupportedError') {
          errorMessage = "이 브라우저는 카메라 기능을 지원하지 않습니다.";
        }
        
        alert(errorMessage);
        setUseWebcam(false);
        setCameraReady(false);
      }
    }, 100);
  };

  // 웹캠 정지
  const stopWebcam = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setUseWebcam(false);
    setCameraReady(false);
    // 카메라 취소 시에는 이미지를 초기화하지 않음 (촬영한 사진 유지)
  };

  // 사진 촬영
  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current || !cameraReady) {
      alert("카메라가 준비되지 않았습니다.");
      return;
    }

    const canvas = canvasRef.current;
    const video = videoRef.current;
    
    // 비디오 크기 확인
    if (video.videoWidth === 0 || video.videoHeight === 0) {
      alert("카메라가 아직 준비되지 않았습니다. 잠시 후 다시 시도해주세요.");
      return;
    }
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);
    
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], 'camera-photo.jpg', { type: 'image/jpeg' });
        setStainFile(file);
        setStainImage(URL.createObjectURL(blob));
        stopWebcam();
        setStainSelectedOption("사진 찍기");
      }
    }, 'image/jpeg', 0.8);
  };

  const handleStainImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setStainImage(URL.createObjectURL(file));
      setStainFile(file);
      setStainSelectedOption("파일 선택");
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
      const response = await axios.post(ANALYSIS_URL, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: token ? `Bearer ${token}` : "",
        },
      });

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
        setStainFile(null);
        setStainImage(null);
        setStainSelectedOption("이미지 업로드 형식 선택");
      }
    } catch (err) {
      console.error("분석 요청 실패:", err);
      const errorMessage =
        err.response?.data?.error?.message || "서버 오류로 분석에 실패했습니다.";
      alert(errorMessage);
      setStainFile(null);
      setStainImage(null);
      setStainSelectedOption("이미지 업로드 형식 선택");
      window.location.reload();
    } finally {
      setLoading(false);
    }
  };

  const handleStainOptionChange = (e) => {
    const option = e.target.value;
    setStainSelectedOption(option);

    // 옵션 변경 시 웹캠 정지
    if (useWebcam) {
      stopWebcam();
    }

    if (option === "사진 보관함" || option === "파일 선택") {
      // 파일 선택 시 기존 이미지 초기화
      setStainImage(null);
      setStainFile(null);
      
      if (stainFileInputRef.current) {
        stainFileInputRef.current.value = '';
        stainFileInputRef.current.click();
      }
    } else if (option === "사진 찍기") {
      // HTTP 환경에서는 직접 카메라 접근 불가
      if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
        alert('HTTP 환경에서는 직접 카메라 촬영이 불가능합니다.\n"사진 보관함"을 선택하여 촬영된 사진을 업로드해주세요.');
        setStainSelectedOption("이미지 업로드 형식 선택");
        return;
      }
      startWebcam();
    } else if (option === "이미지 업로드 형식 선택") {
      // 기본 옵션 선택 시 모든 상태 초기화
      setStainImage(null);
      setStainFile(null);
    }
  };

  // 컴포넌트 언마운트 시 웹캠 정리
  useEffect(() => {
    return () => {
      stopWebcam();
    };
  }, []);

  return (
    <div className="flex flex-col min-h-screen w-full bg-gray-50 sandol-font">
      <Header />
      <div className="container mx-auto max-w-md px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-6">얼룩 분석</h1>
        <div className="mb-6 text-2xl">
          <p className="mb-2">얼룩 이미지를 업로드하세요</p>
          <div className="relative">
            <select
              className="w-full p-3 border rounded-md appearance-none bg-white pr-8"
              value={stainSelectedOption}
              onChange={handleStainOptionChange}
            >
              <option value="이미지 업로드 형식 선택">이미지 업로드 형식 선택</option>
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* 파일 업로드 input - 모바일 최적화 */}
          <input
            type="file"
            accept="image/*"
            capture="environment" // 모바일에서 카메라 앱 직접 실행
            onChange={handleStainImageUpload}
            className="hidden"
            ref={stainFileInputRef}
          />

          {/* 웹캠 화면 */}
          {useWebcam && (
            <div className="mt-4 relative">
              <p className="text-sm text-gray-600 mb-2">
                {!cameraReady ? "카메라 로딩 중..." : "카메라 준비됨"}
              </p>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full rounded-md border bg-gray-100"
                style={{ maxHeight: '400px' }}
              />
              <canvas ref={canvasRef} className="hidden" />
              <div className="flex gap-2 mt-3">
                <button
                  onClick={capturePhoto}
                  disabled={!cameraReady}
                  className="flex-1 py-2 bg-blue-500 text-white rounded-md font-medium disabled:bg-gray-400"
                >
                  📸 {cameraReady ? "촬영" : "준비 중..."}
                </button>
                <button
                  onClick={stopWebcam}
                  className="flex-1 py-2 bg-gray-500 text-white rounded-md font-medium"
                >
                  취소
                </button>
              </div>
            </div>
          )}

          {stainImage && !useWebcam && (
            <div className="mt-3">
              <img
                src={stainImage}
                alt="얼룩 이미지"
                className="w-full h-auto rounded-md border"
              />
            </div>
          )}
        </div>

        <div className="mt-10">
          <button
            className="w-full py-3 bg-sky-200 rounded-md text-2xl font-medium disabled:opacity-50"
            onClick={handleStainAnalysis}
            disabled={loading}
          >
            {loading ? "분석 중..." : "분석하기"}
          </button>

          {loading && (
            <p className="text-center mt-3 text-gray-500 text-lg">
              잠시만 기다려주세요. 분석 중입니다...
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default StainAnalyzePage;