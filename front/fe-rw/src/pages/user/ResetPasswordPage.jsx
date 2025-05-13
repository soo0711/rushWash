import React, { useState } from "react";
import Header from "../../components/common/Header";
import { Link, useNavigate } from "react-router-dom";

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [passwords, setPasswords] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [errorMsg, setErrorMsg] = useState("");

  // 비밀번호 변경 핸들러
  const handleChange = (e) => {
    const { name, value } = e.target;
    setPasswords({
      ...passwords,
      [name]: value,
    });
    setErrorMsg("");
  };

  // 비밀번호 재설정 제출 핸들러
  const handleSubmit = (e) => {
    e.preventDefault();

    // 유효성 검사
    if (!passwords.newPassword || !passwords.confirmPassword) {
      setErrorMsg("모든 필드를 입력해주세요");
      return;
    }

    if (passwords.newPassword !== passwords.confirmPassword) {
      setErrorMsg("비밀번호가 일치하지 않습니다");
      return;
    }

    // 비밀번호 재설정 API 호출 로직 추가 (실제 구현 시)
    console.log("비밀번호 변경:", passwords.newPassword);

    alert("비밀번호가 성공적으로 변경되었습니다.");
    navigate("/login"); // 로그인 페이지로 이동
  };

  return (
    <div className="flex flex-col min-h-screen w-full bg-gray-50 sandol-font">
      <Header />

      {/* 비밀번호 재설정 폼 */}
      <div className="container mx-auto max-w-md px-4 py-8">
        <h1 className="text-5xl font-bold text-center mb-8 sandol-font">
          비밀번호 재설정
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6 text-3xl">
          <div>
            <label className="block mb-2 text-3xl">새 비밀번호</label>
            <input
              type="password"
              name="newPassword"
              value={passwords.newPassword}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 p-3"
              required
            />
          </div>

          <div>
            <label className="block mb-2 text-3xl">새 비밀번호 확인</label>
            <input
              type="password"
              name="confirmPassword"
              value={passwords.confirmPassword}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 p-3"
              required
            />
          </div>

          {errorMsg && <p className="text-red-500 text-xl">{errorMsg}</p>}

          <button
            type="submit"
            className="w-full rounded-md bg-sky-200 p-3 font-medium text-3xl"
          >
            비밀번호 변경
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
