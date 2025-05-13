import React, { useState } from "react";
import Header from "../../components/common/Header";
import { Link } from "react-router-dom";

const LoginPage = () => {
  // 폼 상태 관리
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // 입력 변경 핸들러
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // 폼 제출 핸들러
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("로그인 데이터:", formData);
    // 여기에 로그인 API 연동 로직이 추가될 예정
    alert("로그인 기능은 현재 개발 중입니다.");
  };

  return (
    <div className="flex flex-col min-h-screen w-full bg-gray-50 sandol-font">
      <Header />

      {/* 로그인 폼 */}
      <div className="container mx-auto max-w-md px-4 py-8">
        <h1 className="text-5xl font-bold text-center mb-8 sandol-font">
          로그인
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4 text-3xl">
          <div>
            <label className="block mb-1 text-3xl">이메일</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 p-3"
              required
            />
          </div>

          <div>
            <label className="block mb-1">비밀번호</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 p-3"
              required
            />
          </div>

          <div className="flex justify-between text-blue-500">
            <Link to="/find-email">
              <button type="button" className="text-blue-500">
                이메일 찾기
              </button>
            </Link>
            <Link to="/find-password">
              <button type="button" className="text-blue-500">
                비밀번호 찾기
              </button>
            </Link>
          </div>

          <button
            type="submit"
            className="w-full rounded-full p-3 text-3xl font-medium text-3xl"
            style={{ backgroundColor: "#B7F3FF" }}
          >
            로그인
          </button>
        </form>

        <div className="mt-6 text-center text-3xl">
          <p>
            아직 계정이 없으신가요?{" "}
            <Link to="/signup" className="text-blue-500">
              회원가입
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
