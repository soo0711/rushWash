import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/common/Header";

const MainPage = () => {
  const navigate = useNavigate();
  const [hoveredMenu, setHoveredMenu] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // 물방울 터지는 효과를 위한 상태 추가
  const [burstEffects, setBurstEffects] = useState({});

  // 컴포넌트 마운트 시 로그인 상태 확인
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    setIsLoggedIn(!!token); // token이 있으면 true, 없으면 false
  }, []);

  const handleMenuClick = (menuName) => {
    console.log(`${menuName} 메뉴가 클릭되었습니다`);

    // 로그인이 필요한 메뉴들
    const authRequiredMenus = ["분석하기", "분석내역"];

    if (authRequiredMenus.includes(menuName) && !isLoggedIn) {
      // 로그인이 안되어 있으면 alert만 표시
      alert("로그인이 필요한 서비스입니다.");
      return;
    }

    switch (menuName) {
      case "분석하기":
        navigate("/analyze");
        break;
      case "분석내역":
        navigate("/history");
        break;
      case "섬유유연제":
        navigate("/fabricsoftener");
        break;
      case "근처 세탁소":
        navigate("/laundry-map");
        break;
      default:
        break;
    }
  };

  // 마우스 호버 시 물방울 효과 트리거
  const handleMouseEnter = (menuName) => {
    setHoveredMenu(menuName);
    // 새로운 물방울 효과 생성
    setBurstEffects((prev) => ({
      ...prev,
      [menuName]: Array(15)
        .fill()
        .map((_, i) => ({
          id: `${menuName}-${i}-${Date.now()}`,
          size: Math.random() * 40 + 10, // 다양한 크기 (10px ~ 50px)
          left: Math.random() * 100,
          top: Math.random() * 100,
          delay: i * 0.03, // 약간의 시차
          duration: 0.6 + Math.random() * 0.4, // 다양한 속도 (0.6s ~ 1s)
          xMove: (Math.random() - 0.5) * 200, // 무작위 X 방향 이동 (-100 ~ 100)
          yMove: (Math.random() - 0.5) * 200, // 무작위 Y 방향 이동 (-100 ~ 100)
        })),
    }));
  };

  const handleMouseLeave = (menuName) => {
    setHoveredMenu(null);
    // 효과 정리 (1초 후 메모리 정리)
    setTimeout(() => {
      setBurstEffects((prev) => {
        const newEffects = { ...prev };
        delete newEffects[menuName];
        return newEffects;
      });
    }, 1000);
  };

  const renderMenuItem = (menuName, description) => {
    const isHovered = hoveredMenu === menuName;
    const bubbles = burstEffects[menuName] || [];

    return (
      <div
        className={`flex flex-col items-center justify-center rounded-full p-4 md:p-6 text-center aspect-square relative cursor-pointer transition-all duration-300 overflow-hidden`}
        onClick={() => handleMenuClick(menuName)}
        onMouseEnter={() => handleMouseEnter(menuName)}
        onMouseLeave={() => handleMouseLeave(menuName)}
        style={{
          backgroundColor: "#B7F3FF",
          transform: isHovered ? "scale(1.05)" : "scale(1)",
          boxShadow: isHovered
            ? "0 10px 25px rgba(183, 243, 255, 0.4)"
            : "none",
          transition: "all 0.3s ease",
        }}
      >
        {/* 물방울 효과 */}
        {bubbles.map((풍선껌) => (
          <div
            key={bubble.id}
            className="absolute rounded-full bg-white"
            style={{
              width: `${bubble.size}px`,
              height: `${bubble.size}px`,
              left: `${bubble.left}%`,
              top: `${bubble.top}%`,
              opacity: 0.8,
              zIndex: 5,
              animation: `explosiveBurst ${bubble.duration}s ease-out forwards`,
              animationDelay: `${bubble.delay}s`,
              transform: `translate(${bubble.xMove}px, ${bubble.yMove}px) scale(0)`,
            }}
          />
        ))}

        {/* 물보라 효과 (작은 물방울들) */}
        {isHovered && (
          <div className="absolute inset-0 z-0">
            {[...Array(30)].map((_, i) => (
              <div
                key={`splash-${i}`}
                className="absolute rounded-full bg-sky-100"
                style={{
                  width: `${Math.random() * 8 + 2}px`,
                  height: `${Math.random() * 8 + 2}px`,
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animation: `splashDrop 0.8s ease-out forwards`,
                  animationDelay: `${Math.random() * 0.2}s`,
                }}
              />
            ))}
          </div>
        )}

        {/* 콘텐츠 */}
        <div className="relative z-10">
          <p className="m-0 font-bold text-3xl md:text-4xl">{menuName}</p>
          <span className="text-sm md:text-xl text-gray-700 mt-1 px-1 leading-tight">
            {description}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div
      className="flex flex-col min-h-screen w-full bg-gray-50 overflow-y-auto"
      style={{ fontFamily: "'Sandol', 'YoonSSH', sans-serif" }}
    >
      <Header />

      {/* 메인 콘텐츠 */}
      <div className="flex flex-col items-center flex-none">
        <div className="w-full max-w-6xl mx-auto relative">
          <div className="w-full">
            <img
              src={require("../../assets/images/mainbanner.png")}
              alt="얼룩 옷을 들고 있는 여성"
              className="w-full h-auto block"
            />
          </div>
        </div>
      </div>

      {/* 하단 메뉴 */}
      <div className="container mx-auto max-w-6xl px-4 py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
          {renderMenuItem("분석하기", "사진을 찍어 얼룩의 유형을 분석해보세요")}
          {renderMenuItem("분석내역", "이전에 분석한 내용을 다시 확인하세요")}
          {renderMenuItem(
            "섬유유연제",
            "선호하는 향으로 섬유유연제를 추천받으세요"
          )}
          {renderMenuItem(
            "근처 세탁소",
            "가장 가까운 위치의 세탁소를 찾아보세요"
          )}
        </div>
      </div>

      {/* CSS 애니메이션 스타일 */}
      <style jsx>{`
        @keyframes explosiveBurst {
          0% {
            transform: translate(0, 0) scale(0);
            opacity: 0.8;
          }
          10% {
            transform: translate(0, 0) scale(0.3);
            opacity: 0.9;
          }
          50% {
            opacity: 0.6;
          }
          100% {
            transform: translate(var(--x-move, 0), var(--y-move, 0)) scale(3);
            opacity: 0;
          }
        }

        @keyframes splashDrop {
          0% {
            transform: scale(0) translateY(0);
            opacity: 0;
          }
          20% {
            transform: scale(1) translateY(-20px);
            opacity: 0.7;
          }
          100% {
            transform: scale(0) translateY(50px);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default MainPage;
