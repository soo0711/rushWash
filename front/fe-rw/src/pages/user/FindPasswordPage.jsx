import React, { useState } from "react";
import Header from "../../components/common/Header";
import { Link, useNavigate } from "react-router-dom";

const FindPasswordPage = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [nameErrorMsg, setNameErrorMsg] = useState("");
  const [emailErrorMsg, setEmailErrorMsg] = useState("");
  const [codeErrorMsg, setCodeErrorMsg] = useState("");

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
  const handleSendVerification = (e) => {
    e.preventDefault();

    if (!name) {
      setNameErrorMsg("이름을 입력하지 않았습니다");
      return;
    }

    if (!email) {
      setEmailErrorMsg("이메일을 입력하지 않았습니다");
      return;
    }

    console.log("인증번호 전송:", name, email);
    // 여기에 실제 인증번호 전송 API 호출 로직 추가
    alert("인증번호가 전송되었습니다.");
    setIsEmailVerified(true);
  };

  // 인증번호 확인 핸들러
  const handleVerifyCode = (e) => {
    e.preventDefault();
    if (!verificationCode) {
      setCodeErrorMsg("인증번호를 입력하지 않았습니다");
      return;
    }
    console.log("인증번호 확인:", verificationCode);
    // 여기에 실제 인증번호 확인 API 호출 로직 추가
    alert("인증이 완료되었습니다. 비밀번호 재설정 페이지로 이동합니다.");
    // 비밀번호 재설정 페이지로 이동
    navigate("/reset-password", { state: { name, email } });
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
