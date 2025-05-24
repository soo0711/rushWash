import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Header from "../../components/common/Header";
import axios from "axios";
import { USER_API, useProxy, PROXY_API } from "../../constants/api";

const LoginPage = () => {
  const navigate = useNavigate();

  // API URL 설정
  const SIGN_IN_URL = useProxy ? PROXY_API.SIGN_IN : USER_API.SIGN_IN;

  // 폼 상태 관리
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // 오류 및 로딩 상태 관리
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 입력 변경 핸들러
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // 입력 변경 시 이전 오류 메시지 초기화
    setError("");
  };

  // 폼 제출 핸들러
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      // API 요청을 위한 데이터 준비
      const loginData = {
        email: formData.email,
        password: formData.password,
        refreshToken: "", // 첫 로그인 시에는 빈 문자열
      };

      // 로그인 API 호출
      const response = await axios.post(SIGN_IN_URL, loginData);

      // 성공 처리
      if (response.data.success) {
        // 토큰과 사용자 정보 저장
        const { accessToken, refreshToken } = response.data.data;
        const userData = response.data.data.user;

        // 로컬 스토리지에 토큰과 사용자 정보 저장
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
        localStorage.setItem("userData", JSON.stringify(userData));

        // 관리자 계정 확인 후 이동 분기
        if (userData.email === "rushWashAdmin@gachon.ac.kr") {
          alert("관리자로 로그인되었습니다.");
          navigate("/admin/dashboard");
        } else {
          alert("로그인에 성공했습니다.");
          navigate("/");
        }
      } else {
        // 서버에서 success가 false인 경우
        setError(response.data.error?.message || "로그인에 실패했습니다.");
      }
    } catch (err) {
      console.error("로그인 오류:", err);

      // 오류 응답 처리
      if (err.response) {
        // 서버가 응답을 반환한 경우
        if (err.response.status === 404) {
          setError("이메일 또는 비밀번호가 일치하지 않습니다.");
        } else {
          setError(
            err.response.data.error?.message || "로그인 중 오류가 발생했습니다."
          );
        }
      } else if (err.request) {
        // 요청은 보냈지만 응답을 받지 못한 경우
        setError("서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.");
      } else {
        // 요청 설정 중 오류가 발생한 경우
        setError("로그인 요청 중 오류가 발생했습니다.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen w-full bg-gray-50 sandol-font">
      <Header />

      {/* 로그인 폼 */}
      <div className="container mx-auto max-w-md px-4 py-8">
        <h1 className="text-5xl font-bold text-center mb-8 sandol-font">
          로그인
        </h1>

        {/* 오류 메시지 표시 */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-3xl">
            {error}
          </div>
        )}

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
              disabled={loading}
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
              disabled={loading}
            />
          </div>

          <div className="flex justify-between text-blue-500">
            <Link to="/find-email">
              <button
                type="button"
                className="text-blue-500"
                disabled={loading}
              >
                이메일 찾기
              </button>
            </Link>
            <Link to="/find-password">
              <button
                type="button"
                className="text-blue-500"
                disabled={loading}
              >
                비밀번호 찾기
              </button>
            </Link>
          </div>

          <button
            type="submit"
            className="w-full rounded-full p-3 text-3xl font-medium"
            style={{ backgroundColor: "#B7F3FF" }}
            disabled={loading}
          >
            {loading ? "로그인 중..." : "로그인"}
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
