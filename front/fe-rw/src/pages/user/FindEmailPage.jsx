import React, { useState } from "react";
import Header from "../../components/common/Header";
import { Link } from "react-router-dom";
import axios from "axios";
import { USER_API, PROXY_API, useProxy } from "../../constants/api";

const FindEmailPage = () => {
  // 폼 상태 관리
  const [phoneNumber, setPhoneNumber] = useState("");
  const [foundEmail, setFoundEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  // API URL 설정
  const EMAIL_FIND_URL = useProxy ? PROXY_API.EMAIL_FIND : USER_API.EMAIL_FIND;

  // 입력 변경 핸들러
  const handleChange = (e) => {
    setPhoneNumber(e.target.value);
    // 이전 상태 초기화
    setError("");
    setSubmitted(false);
    setFoundEmail("");
  };

  // 전화번호 형식 포맷팅 (하이픈 추가)
  const formatPhoneNumber = (value) => {
    // 숫자만 남기기
    const numbers = value.replace(/[^\d]/g, "");

    // 형식에 맞게 하이픈 추가
    if (numbers.length <= 3) {
      return numbers;
    } else if (numbers.length <= 7) {
      return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    } else {
      return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(
        7,
        11
      )}`;
    }
  };

  // 전화번호 입력 핸들러 (하이픈 자동 추가)
  const handlePhoneNumberChange = (e) => {
    const formattedNumber = formatPhoneNumber(e.target.value);
    setPhoneNumber(formattedNumber);
  };

  // 폼 제출 핸들러
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      // API 요청
      const response = await axios.get(EMAIL_FIND_URL, {
        params: {
          arg0: {
            phoneNumber: phoneNumber,
          },
        },
      });

      // 응답 처리
      if (response.data.success) {
        // 이메일 찾기 성공
        setFoundEmail(response.data.data.email);
        setSubmitted(true);
      } else {
        // 서버에서 success가 false인 경우
        setError(response.data.error?.message || "이메일을 찾을 수 없습니다.");
      }
    } catch (err) {
      console.error("이메일 찾기 오류:", err);

      // 오류 응답 처리
      if (err.response) {
        // 서버가 응답을 반환한 경우
        if (err.response.status === 404) {
          setError("사용자 정보를 찾을 수 없습니다.");
        } else {
          setError(
            err.response.data.error?.message ||
              "이메일 찾기 중 오류가 발생했습니다."
          );
        }
      } else if (err.request) {
        // 요청은 보냈지만 응답을 받지 못한 경우
        setError("서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.");
      } else {
        // 요청 설정 중 오류가 발생한 경우
        setError("이메일 찾기 요청 중 오류가 발생했습니다.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen w-full bg-gray-50 sandol-font">
      <Header />

      {/* 이메일 찾기 폼 */}
      <div className="container mx-auto max-w-md px-4 py-8">
        <h1 className="text-5xl font-bold text-center mb-8 sandol-font">
          이메일 찾기
        </h1>

        {/* 오류 메시지 표시 */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-3xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 text-3xl">
          <div>
            <label className="block mb-2 text-3xl">핸드폰 번호</label>
            <div className="flex">
              <input
                type="tel"
                name="phone"
                value={phoneNumber}
                onChange={handlePhoneNumberChange}
                placeholder="ex) 010-1234-5678"
                className="w-full rounded-md border border-gray-300 p-3"
                required
                disabled={loading}
              />
              <button
                type="submit"
                className="ml-2 rounded-md px-12 py-2 font-medium"
                style={{
                  height: "100%",
                  minWidth: "3rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "#B7F3FF",
                }}
                disabled={loading}
              >
                {loading ? "처리중..." : "입력"}
              </button>
            </div>
          </div>
        </form>

        {submitted && foundEmail && (
          <div className="mt-8 space-y-6 text-3xl">
            <p className="text-3xl mb-4">회원님의 이메일은</p>
            <p className="text-3xl font-bold mb-6">{foundEmail} 입니다</p>

            <div className="mt-8 flex justify-center">
              <Link to="/login">
                <button
                  className="w-full rounded-full p-3 text-3xl font-medium"
                  style={{ backgroundColor: "#B7F3FF", minWidth: "200px" }}
                >
                  로그인하러 가기
                </button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FindEmailPage;
