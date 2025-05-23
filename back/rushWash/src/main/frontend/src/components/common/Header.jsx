import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { USER_API, useProxy, PROXY_API } from "../../constants/api";

const Header = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();

  // API URL 설정
  const SIGN_OUT_URL = useProxy ? PROXY_API.SIGN_OUT : USER_API.SIGN_OUT;

  // 컴포넌트가 마운트될 때 로그인 상태 확인
  useEffect(() => {
    // 로컬 스토리지에서 토큰과 사용자 데이터 확인
    const token = localStorage.getItem("accessToken");
    const storedUserData = localStorage.getItem("userData");

    if (token && storedUserData) {
      setIsLoggedIn(true);
      try {
        setUserData(JSON.parse(storedUserData));
      } catch (error) {
        console.error("사용자 데이터 파싱 오류:", error);
      }
    }
  }, []);

  // 로그아웃 처리
  const handleLogout = async () => {
    try {
      // 로그아웃 API 호출
      const response = await axios.post(
        SIGN_OUT_URL,
        {},
        {
          headers: {
            Authorization: localStorage.getItem("accessToken"),
          },
        }
      );

      // 응답 처리
      if (response.data.success) {
        // 로컬 스토리지 초기화
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("userData");

        // 상태 업데이트
        setIsLoggedIn(false);
        setUserData(null);

        // 홈페이지로 리다이렉트
        navigate("/");
      } else {
        console.error("로그아웃 실패:", response.data.error?.message);
      }
    } catch (error) {
      console.error("로그아웃 중 오류 발생:", error);

      // 서버 오류가 발생하더라도 클라이언트에서 로그아웃 처리
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("userData");

      setIsLoggedIn(false);
      setUserData(null);
      navigate("/");
    }
  };

  return (
    <header
      className="flex justify-between items-center p-3 w-full"
      style={{ backgroundColor: "#B7F3FF" }}
    >
      <div className="container mx-auto flex justify-between items-center px-4 max-w-6xl">
        <div>
          <Link to="/">
            <img
              src={require("../../assets/images/logo.png")}
              alt="빨랑 빨래 로고"
              className="h-12 md:h-16"
            />
          </Link>
        </div>
        <div className="text-2xl md:text-xl">
          {isLoggedIn ? (
            // 로그인 된 경우 로그아웃 버튼 표시
            <button onClick={handleLogout} className="cursor-pointer">
              로그아웃
            </button>
          ) : (
            // 로그인 안 된 경우 회원가입과 로그인 링크 표시
            <>
              <Link to="/signup" className="cursor-pointer">
                회원가입
              </Link>
              <span className="mx-2">|</span>
              <Link to="/login" className="cursor-pointer">
                로그인
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
