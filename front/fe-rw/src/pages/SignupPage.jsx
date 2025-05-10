import React, { useState } from "react";
import Header from "../components/common/Header";

const SignupPage = () => {
  // 폼 상태 관리
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false,
  });

  // 입력 변경 핸들러
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // 폼 제출 핸들러
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("폼 데이터:", formData);
    // 여기에 API 연동 로직이 추가될 예정
    alert("회원가입 기능은 현재 개발 중입니다.");
  };

  return (
    <div className="flex flex-col min-h-screen w-full bg-gray-50 sandol-font">
      <Header />

      {/* 회원가입 폼 */}
      <div className="container mx-auto max-w-md px-4 py-8">
        <h1 className="text-5xl font-bold text-center mb-8 sandol-font">
          회원가입
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4 text-3xl">
          <div>
            <label className="block mb-1 text-3xl">이름</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 p-3"
              required
            />
          </div>

          <div>
            <label className="block mb-1">이메일</label>
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
            <label className="block mb-1">핸드폰 번호</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="ex) 010-1234-5678"
              className="w-full rounded-md border border-gray-300 p-3"
              required
            />
          </div>

          <div>
            <button
              type="button"
              className="w-full rounded-md bg-blue-400 text-white p-3 font-medium"
              onClick={() => alert("인증번호 기능은 현재 개발 중입니다.")}
            >
              중복 확인
            </button>
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

          <div>
            <label className="block mb-1">비밀번호 확인</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 p-3"
              required
            />
          </div>

          <div className="flex items-center text-3xl">
            <input
              type="checkbox"
              name="agreeTerms"
              checked={formData.agreeTerms}
              onChange={handleChange}
              className="h-5 w-5 mr-2"
              required
            />
            <label className="text-3xl">
              서비스 이용약관 및 개인정보 처리방침에 동의합니다
            </label>
          </div>

          <button
            type="submit"
            className="w-full rounded-full p-3 text-3xl font-medium text-3xl"
            style={{ backgroundColor: "#B7F3FF" }}
          >
            회원가입
          </button>
        </form>
      </div>
    </div>
  );
};

export default SignupPage;
