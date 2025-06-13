import React, { useState } from "react";
import Header from "../../components/common/Header";
import { Link, useNavigate } from "react-router-dom";
import { USER_API, PROXY_API, useProxy } from "../../constants/api";
import axios from "axios";


const FindPasswordPage = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [nameErrorMsg, setNameErrorMsg] = useState("");
  const [emailErrorMsg, setEmailErrorMsg] = useState("");
  const [codeErrorMsg, setCodeErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  //API URL 설정
  const VERIFY_CODE_URL = useProxy ? PROXY_API.VERIFY_CODE : USER_API.VERIFY_CODE;
  const VERIFY_CODE_CHECK_URL = useProxy ? PROXY_API.VERIFY_CODE_CHECK : USER_API.VERIFY_CODE_CHECK;

  // 이름 변경 핸들러
  const handleNameChange = (e) => {
    setName(e.target.value);
    setNameErrorMsg("");
  };

  // 이메일 변경 핸들러
  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    setEmailErrorMsg("");
  };

  // 인증번호 변경 핸들러
  const handleCodeChange = (e) => {
    setVerificationCode(e.target.value);
    setCodeErrorMsg("");
  };

  // 인증번호 전송 핸들러
  const handleSendVerification = async (e) => {
  e.preventDefault();

  // 기본 입력값 검증
  if (!name) {
    setNameErrorMsg("이름을 입력하지 않았습니다");
    return;
  }

  if (!email) {
    setEmailErrorMsg("이메일을 입력하지 않았습니다");
    return;
  }

  try {
    setLoading(true);
    setError(""); // 이전 오류 초기화

    // 인증번호 전송 요청
    const response = await axios.post(VERIFY_CODE_URL, {
      name: name,
      email: email,
    });

    if (response.data.success && response.data.data.success) {
      alert("인증번호가 전송되었습니다.");
      console.log("인증번호:", response.data.data.verifyCode); // 개발 중일 때만 노출

      setIsEmailVerified(true);
    } else {
      const msg = response.data.error?.message || "인증번호 전송에 실패했습니다.";
      setError(msg);
      alert(msg); 
    }
  } catch (err) {
    console.error("인증번호 전송 오류:", err);

    let msg = "";

    if (err.response) {
      msg = err.response.data.error?.message || "서버 오류가 발생했습니다.";
    } else if (err.request) {
      msg = "서버에 연결할 수 없습니다. 네트워크를 확인해주세요.";
    } else {
      msg = "알 수 없는 오류가 발생했습니다.";
    }

    setError(msg);
    alert(msg);

  } finally {
    setLoading(false);
  }
};

  // 인증번호 확인 핸들러
  const handleVerifyCode = async (e) => {
  e.preventDefault();

  if (!verificationCode) {
    setCodeErrorMsg("인증번호를 입력하지 않았습니다");
    return;
  }

  try {
    setLoading(true);
    setError("");

    // API 요청
    const response = await axios.post(VERIFY_CODE_CHECK_URL, {
      email: email,
      verifyCode: verificationCode,
    });

    if (response.data.success && response.data.data.success) {
      alert("인증이 완료되었습니다. 비밀번호 재설정 페이지로 이동합니다.");
      
      // 비밀번호 재설정 페이지로 이동하면서 사용자 정보 전달
      navigate("/reset-password", {
        state: {
          name: name,
          email: email,
          userId: response.data.data.userId, // 백엔드에서 온 유저 ID
        },
      });
    } else {
      setError(response.data.error?.message || "인증에 실패했습니다.");
    }
  } catch (err) {
    console.error("인증번호 확인 오류:", err);

    if (err.response) {
      setError(
        err.response.data.error?.message || "서버 오류가 발생했습니다."
      );
    } else if (err.request) {
      setError("서버에 연결할 수 없습니다. 네트워크를 확인해주세요.");
    } else {
      setError("알 수 없는 오류가 발생했습니다.");
    }
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="flex flex-col min-h-screen w-full bg-gray-50 sandol-font">
      <Header />

      {/* 비밀번호 찾기 폼 */}
      <div className="container mx-auto max-w-md px-4 py-8">
        <h1 className="text-5xl font-bold text-center mb-8 sandol-font">
          비밀번호 찾기
        </h1>

        <div className="space-y-6 text-3xl">
          {/* 이름 입력 필드 */}
          <div>
            <label className="block mb-2 text-3xl">이름 입력</label>
            <input
              type="text"
              value={name}
              onChange={handleNameChange}
              className="w-full rounded-md border border-gray-300 p-3"
              placeholder=""
              required
            />
            {nameErrorMsg && (
              <p className="text-red-500 text-sm mt-1">{nameErrorMsg}</p>
            )}
          </div>

          <div>
            <label className="block mb-2 text-3xl">이메일 입력</label>
            <div className="flex">
              <input
                type="email"
                value={email}
                onChange={handleEmailChange}
                className="w-full rounded-md border border-gray-300 p-3"
                placeholder=""
                required
              />
              <button
                onClick={handleSendVerification}
                className="ml-2 rounded-md bg-sky-200 px-4 py-2 font-medium"
              >
                인증번호 전송
              </button>
            </div>
            {emailErrorMsg && (
              <p className="text-red-500 text-sm mt-1">{emailErrorMsg}</p>
            )}
          </div>

          {isEmailVerified && (
            <>
              <p className="text-gray-500 text-2lg">
                인증번호가 전송되었습니다
              </p>

              <div>
                <label className="block mb-2 text-3xl">인증번호 입력</label>
                <input
                  type="text"
                  value={verificationCode}
                  onChange={handleCodeChange}
                  className="w-full rounded-md border border-gray-300 p-3"
                  required
                />
                {codeErrorMsg && (
                  <p className="text-red-500 text-sm mt-1">{codeErrorMsg}</p>
                )}
                {error && (
                  <p className="text-red-500 text-sm mt-2">{error}</p>
                )}
              </div>

              <button
                onClick={handleVerifyCode}
                className="w-full rounded-md bg-sky-200 p-3 font-medium text-3xl"
              >
                인증번호 확인
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default FindPasswordPage;
