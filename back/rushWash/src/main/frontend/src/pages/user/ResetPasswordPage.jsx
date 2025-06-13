import React, { useState } from "react";
import Header from "../../components/common/Header";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { USER_API, PROXY_API, useProxy } from "../../constants/api";
import { useLocation } from "react-router-dom";


const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { name, email, userId } = location.state || {};
  const [passwords, setPasswords] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // API URL 설정
  const PASSWORD_UPDATE_URL = useProxy ? PROXY_API.PASSWORD_UPDATE : USER_API.PASSWORD_UPDATE;

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
  const handleSubmit = async (e) => {
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

  try {
    setLoading(true);
    setErrorMsg("");
    console.log(userId);
    console.log(passwords);
    // 비밀번호 재설정 요청
    const response = await axios.patch(PASSWORD_UPDATE_URL, {
      userId: userId, // 전달받은 유저 ID
      password: passwords.newPassword,
    });

    if (response.data.success) {
      alert("비밀번호가 성공적으로 변경되었습니다.");
      navigate("/login"); // 로그인 페이지로 이동
    } else {
      setErrorMsg(response.data.error?.message || "비밀번호 변경 실패");
    }
  } catch (err) {
    console.error("비밀번호 변경 오류:", err);

    if (err.response) {
      setErrorMsg(
        err.response.data.error?.message || "서버 오류가 발생했습니다"
      );
    } else if (err.request) {
      setErrorMsg("서버에 연결할 수 없습니다. 네트워크를 확인해주세요.");
    } else {
      setErrorMsg("비밀번호 변경 중 알 수 없는 오류가 발생했습니다.");
    }
  } finally {
    setLoading(false);
  }
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
