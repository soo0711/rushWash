import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/common/Header";
import axios from "axios";
import { USER_API, useProxy, PROXY_API } from "../../constants/api";

const SignupPage = () => {
  const navigate = useNavigate();

  // API URL 설정
  const SIGNUP_URL = useProxy ? PROXY_API.SIGNUP : USER_API.SIGNUP;
  const DUPLICATE_CHECK_URL = useProxy
    ? PROXY_API.DUPLICATE_CHECK
    : USER_API.DUPLICATE_CHECK;

  // 폼 상태 관리
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNumber: "", // API에 맞게 phoneNumber로 변경
    password: "",
    confirmPassword: "",
    agreeTerms: false,
  });

  // 오류 및 로딩 상태 관리
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [emailChecked, setEmailChecked] = useState(false);
  const [emailError, setEmailError] = useState("");

  // 입력 변경 핸들러
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    let processedValue = value;

    // 전화번호 필드인 경우 포맷팅 적용
    if (name === "phoneNumber") {
      processedValue = formatPhoneNumber(value);
    }
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : processedValue,
    });

    // 이메일이 변경되면 중복 확인 상태 초기화
    if (name === "email") {
      setEmailChecked(false);
      setEmailError("");
    }

    // 오류 메시지 초기화
    setError("");
  };

  // 이메일 중복 확인
  const handleCheckDuplicate = async () => {
    if (!formData.email) {
      setEmailError("이메일을 입력해주세요.");
      return;
    }

    try {
      setLoading(true);

      // 중복 확인 API 호출
      const response = await axios.post(DUPLICATE_CHECK_URL, {
        email: formData.email,
        phoneNumber: formData.phoneNumber, // API 요구사항에 맞게 추가
      });

      // 성공 처리
      if (response.data.success) {
        alert("사용 가능한 이메일입니다.");
        setEmailChecked(true);
        setEmailError("");
      } else {
        setEmailError(
          response.data.error?.message ||
            "이메일 중복 확인 중 오류가 발생했습니다."
        );
        setEmailChecked(false);
      }
    } catch (err) {
      console.error("이메일 중복 확인 오류:", err);
      if (err.response && err.response.data.error) {
        setEmailError(
          err.response.data.error.message || "이미 사용 중인 이메일입니다."
        );
      } else {
        setEmailError("이메일 중복 확인 중 오류가 발생했습니다.");
      }
      setEmailChecked(false);
    } finally {
      setLoading(false);
    }
  };
  // 전화번호 포맷팅 함수 추가
  const formatPhoneNumber = (value) => {
    // 숫자만 추출
    const phoneNumber = value.replace(/[^\d]/g, "");

    // 길이에 따라 포맷팅
    if (phoneNumber.length <= 3) {
      return phoneNumber;
    } else if (phoneNumber.length <= 7) {
      return `${phoneNumber.slice(0, 3)}-${phoneNumber.slice(3)}`;
    } else {
      return `${phoneNumber.slice(0, 3)}-${phoneNumber.slice(
        3,
        7
      )}-${phoneNumber.slice(7, 11)}`;
    }
  };

  // 비밀번호 일치 확인
  const validatePassword = () => {
    if (formData.password !== formData.confirmPassword) {
      setError("비밀번호와 비밀번호 확인이 일치하지 않습니다.");
      return false;
    }
    return true;
  };

  // 폼 제출 핸들러
  const handleSubmit = async (e) => {
    e.preventDefault();

    // 이메일 중복 확인 여부 검사
    if (!emailChecked) {
      setError("이메일 중복 확인을 먼저 해주세요.");
      return;
    }

    // 비밀번호 일치 확인
    if (!validatePassword()) {
      return;
    }

    // 약관 동의 확인
    if (!formData.agreeTerms) {
      setError("서비스 이용약관 및 개인정보 처리방침에 동의해주세요.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      // API 요청을 위한 데이터 준비
      const signupData = {
        name: formData.name,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        password: formData.password,
      };

      // 회원가입 API 호출
      const response = await axios.post(SIGNUP_URL, signupData);

      // 성공 처리
      if (response.data.success) {
        alert("회원가입이 완료되었습니다. 로그인 페이지로 이동합니다.");
        navigate("/login"); // 로그인 페이지로 이동
      } else {
        // 서버에서 success가 false인 경우
        setError(
          response.data.error?.message || "회원가입 중 오류가 발생했습니다."
        );
      }
    } catch (err) {
      console.error("회원가입 오류:", err);

      // 오류 응답 처리
      if (err.response) {
        setError(
          err.response.data.error?.message || "회원가입 중 오류가 발생했습니다."
        );
      } else if (err.request) {
        setError("서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.");
      } else {
        setError("회원가입 요청 중 오류가 발생했습니다.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen w-full bg-gray-50 sandol-font">
      <Header />

      {/* 회원가입 폼 */}
      <div className="container mx-auto max-w-md px-4 py-8">
        <h1 className="text-5xl font-bold text-center mb-8 sandol-font">
          회원가입
        </h1>

        {/* 오류 메시지 표시 */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

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
              disabled={loading}
            />
          </div>

          <div>
            <label className="block mb-1">이메일</label>
            <div className="flex space-x-2">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full rounded-md border ${
                  emailError ? "border-red-500" : "border-gray-300"
                } p-3`}
                required
                disabled={loading || emailChecked}
              />
              <button
                type="button"
                className={`whitespace-nowrap rounded-md ${
                  emailChecked ? "bg-green-500" : "bg-blue-400"
                } text-white p-3 font-medium`}
                onClick={handleCheckDuplicate}
                disabled={loading || emailChecked}
              >
                {emailChecked ? "확인완료" : "중복확인"}
              </button>
            </div>
            {emailError && (
              <p className="text-red-500 text-sm mt-1">{emailError}</p>
            )}
            {emailChecked && (
              <p className="text-green-500 text-sm mt-1">
                사용 가능한 이메일입니다.
              </p>
            )}
          </div>

          <div>
            <label className="block mb-1">핸드폰 번호</label>
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder="ex) 010-1234-5678"
              className="w-full rounded-md border border-gray-300 p-3"
              maxLength="13"
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

          <div>
            <label className="block mb-1">비밀번호 확인</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 p-3"
              required
              disabled={loading}
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
              disabled={loading}
            />
            <label className="text-3xl">
              서비스 이용약관 및 개인정보 처리방침에 동의합니다
            </label>
          </div>

          <button
            type="submit"
            className="w-full rounded-full p-3 text-3xl font-medium"
            style={{ backgroundColor: "#B7F3FF" }}
            disabled={loading || !emailChecked}
          >
            {loading ? "처리 중..." : "회원가입"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SignupPage;
