import React, { useState } from "react";
import Header from "../components/common/Header";

import { Link } from "react-router-dom";

const FindEmailPage = () => {
  // 폼 상태 관리
  const [phoneNumber, setPhoneNumber] = useState("");
  const [foundEmail, setFoundEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  // 입력 변경 핸들러
  const handleChange = (e) => {
    setPhoneNumber(e.target.value);
  };

  // 폼 제출 핸들러
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("핸드폰 번호:", phoneNumber);

    // 여기서는 예시로 이메일을 찾았다고 가정합니다
    // 실제로는 API를 통해 서버에서 이메일 정보를 가져와야 합니다
    setFoundEmail("gachon@naver.com");
    setSubmitted(true);
  };

  return (
    <div className="flex flex-col min-h-screen w-full bg-gray-50 sandol-font">
      <Header />

      {/* 이메일 찾기 폼 */}
      <div className="container mx-auto max-w-md px-4 py-8">
        <h1 className="text-5xl font-bold text-center mb-8 sandol-font">
          이메일 찾기
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6 text-3xl">
          <div>
            <label className="block mb-2 text-3xl">핸드폰 번호</label>
            <div className="flex">
              <input
                type="tel"
                name="phone"
                value={phoneNumber}
                onChange={handleChange}
                placeholder="ex) 010-1234-5678"
                className="w-full rounded-md border border-gray-300 p-3"
                required
              />
              <button
                type="submit"
                className="ml-2 rounded-md bg-sky-200 px-12 py-2 font-medium"
                style={{
                  height: "100%",
                  minWidth: "3rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                입력
              </button>
            </div>
          </div>
        </form>

        {submitted && (
          <div className="mt-8 space-y-6 text-3xl">
            <p className="text-3xl mb-4">회원님의 이메일은</p>
            <p className="text-3xl font-bold mb-6">{foundEmail} 입니다</p>

            <div className="absolute bottom-4 right-4">
              <Link to="/">
                <img
                  src={require("../assets/images/home.png")}
                  className="w-24 h-20"
                />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FindEmailPage;
