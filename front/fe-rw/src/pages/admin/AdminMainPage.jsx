import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const AdminMainPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();

    // 기본 검증
    if (!email) {
      setLoginError("이메일을 입력해주세요");
      return;
    }
    if (!password) {
      setLoginError("비밀번호를 입력해주세요");
      return;
    }

    // 실제로는 API 호출하여 로그인 처리
    console.log("관리자 로그인 시도:", email, password);

    // 목업: 로그인 성공 가정
    navigate("/admin/dashboard");
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center py-6 md:py-12 px-4 sm:px-6 lg:px-8"
      style={{
        backgroundImage:
          "linear-gradient(135deg, #e6f7ff 25%, #d0ebff 25%, #d0ebff 50%, #e6f7ff 50%, #e6f7ff 75%, #d0ebff 75%, #d0ebff 100%)",
        backgroundSize: "40px 40px",
      }}
    >
      <div className="max-w-lg w-full space-y-6 bg-white p-6 md:p-10 rounded-xl shadow-lg">
        <div className="flex flex-col items-center">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-blue-500 mb-2">
              <span className="text-blue-600">빨랑</span>
              <span className="text-blue-400">빨래</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-700 font-medium">
              관리자 로그인 페이지
            </p>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row items-center">
            <div className="sm:ml-4 bg-gray-200 rounded-full p-4 relative flex items-center justify-center">
              <div className="absolute sm:-left-2 -top-2 sm:top-1/2 sm:transform sm:-translate-y-1/2 w-3 h-3 bg-gray-200 rotate-45"></div>
              <span className="text-5xl" role="img" aria-label="세탁 이모티콘">
                👕
              </span>
            </div>
          </div>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="rounded-md space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-gray-700 text-lg font-medium mb-2"
              >
                이메일
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="이메일 주소"
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-gray-700 text-lg font-medium mb-2"
              >
                비밀번호
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="비밀번호"
              />
            </div>
          </div>

          {loginError && (
            <div className="text-red-500 text-base text-center">
              {loginError}
            </div>
          )}

          <div className="mt-8">
            <button
              type="submit"
              className="group relative w-full flex justify-center py-3 px-6 border border-transparent text-xl font-medium rounded-full text-white bg-blue-400 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:scale-105 shadow-md"
            >
              로그인
            </button>
          </div>

          <div className="text-center mt-4">
            <Link
              to="/"
              className="text-base text-blue-600 hover:text-blue-800 hover:underline transition-colors"
            >
              사용자 페이지로 이동
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminMainPage;
