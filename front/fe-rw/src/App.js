import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";

// user 페이지 컴포넌트 임포트
import MainPage from "./pages/user/MainPage";
import SignupPage from "./pages/user/SignupPage";
import LoginPage from "./pages/user/LoginPage";
import FindEmailPage from "./pages/user/FindEmailPage";
import FindPasswordPage from "./pages/user/FindPasswordPage";
import ResetPasswordPage from "./pages/user/ResetPasswordPage";
import AnalyzePage from "./pages/user/AnalyzePage";
import BothAnalyzePage from "./pages/user/BothAnalyzePage";
import StainAnalyzePage from "./pages/user/StainAnalyzePage";
import LabelAnalyzePage from "./pages/user/LabelAnalyzePage";
import AnalysisResultPage from "./pages/user/AnalysisResultPage";
import HistoryPage from "./pages/user/HistoryPage";
import NearbyLaundryPage from "./pages/user/NearbyLaundryPage";
import FabricSoftenerPage from "./pages/user/FabricSoftenerPage";
import FabricSoftenerResultPage from "./pages/user/FabricSoftenerResultPage";

// admin 페이지 컴포넌트 임포트
import AdminMainPage from "./pages/admin/AdminMainPage";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AdminUsersPage from "./pages/admin/AdminUsersPage";
import AdminFabricSoftenerPage from "./pages/admin/AdminFabricSoftenerPage";
import AdminWashingHistoriesPage from "./pages/admin/AdminWashingHistoriesPage";
import AdminAIPage from "./pages/admin/AdminAIPage";
import AdminStainRemovalPage from "./pages/admin/AdminStainRemovalPage";

function App() {
  return (
    <Router>
      <div className="w-full mx-auto min-h-screen">
        <Routes>
          {/* 메인 페이지 */}
          <Route path="/" element={<MainPage />} />

          {/* 인증 관련 페이지 */}
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/find-email" element={<FindEmailPage />} />
          <Route path="/find-password" element={<FindPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* 분석 관련 페이지 */}
          <Route path="/analyze" element={<AnalyzePage />} />
          <Route path="/analyze/both" element={<BothAnalyzePage />} />
          <Route path="/analyze/stain" element={<StainAnalyzePage />} />
          <Route path="/analyze/label" element={<LabelAnalyzePage />} />
          <Route
            path="/analyze/result/:analysisType"
            element={<AnalysisResultPage />}
          />

          {/* 기타 기능 페이지 */}
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/fabricsoftener" element={<FabricSoftenerPage />} />
          <Route
            path="/fabricsoftener/result/:categoryId"
            element={<FabricSoftenerResultPage />}
          />
          <Route path="/laundry-map" element={<NearbyLaundryPage />} />

          {/* 관리자 페이지 */}
          <Route path="/admin" element={<AdminMainPage />} />
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
          <Route path="/admin/users" element={<AdminUsersPage />} />
          <Route
            path="/admin/fabric-softeners"
            element={<AdminFabricSoftenerPage />}
          />
          <Route
            path="/admin/washing-histories"
            element={<AdminWashingHistoriesPage />}
          />
          <Route path="/admin/ai" element={<AdminAIPage />} />
          <Route
            path="/admin/stain-removal"
            element={<AdminStainRemovalPage />}
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
