import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import MainPage from "./pages/MainPage";
import SignupPage from "./pages/SignupPage";
import LoginPage from "./pages/LoginPage";
import FindEmailPage from "./pages/FindEmailPage";
import FindPasswordPage from "./pages/FindPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";

function App() {
  return (
    <Router>
      <div className="w-full mx-auto min-h-screen">
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/login" element={<LoginPage></LoginPage>} />
          <Route
            path="/find-email"
            element={<FindEmailPage></FindEmailPage>}
          ></Route>
          <Route
            path="/find-password"
            element={<FindPasswordPage></FindPasswordPage>}
          ></Route>
          <Route
            path="/reset-password"
            element={<ResetPasswordPage></ResetPasswordPage>}
          ></Route>
          <Route
            path="/analyze"
            element={<div>분석하기 페이지 (개발 예정)</div>}
          />
          <Route
            path="/history"
            element={<div>분석내역 페이지 (개발 예정)</div>}
          />
          <Route
            path="/maintenance"
            element={<div>유지관리 페이지 (개발 예정)</div>}
          />
          <Route
            path="/laundry-map"
            element={<div>세탁소 찾기 페이지 (개발 예정)</div>}
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
