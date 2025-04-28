import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import MainPage from "./pages/MainPage";
import SignupPage from "./pages/SignupPage";
import LoginPage from "./pages/LoginPage";
import FindEmailPage from "./pages/FindEmailPage";
import FindPasswordPage from "./pages/FindPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import AnalyzePage from "./pages/AnalyzePage";
import BothAnalyzePage from "./pages/BothAnalyzePage";
import StainAnalyzePage from "./pages/StainAnalyzePage";
import LabelAnalyzePage from "./pages/LabelAnalyzePage";
import HistoryPage from "./pages/HistoryPage";
import NearbyLaundryPage from "./pages/NearbyLaundryPage";
import FabricSoftenerPage from "./pages/FabricSoftenerPage";
import FabricSoftenerResultPage from "./pages/FabricSoftenerResultPage";

function App() {
  return (
    <Router>
      <div className="w-full mx-auto min-h-screen">
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/login" element={<LoginPage></LoginPage>} />
          <Route path="/find-email" element={<FindEmailPage />}></Route>
          <Route path="/find-password" element={<FindPasswordPage />}></Route>
          <Route path="/reset-password" element={<ResetPasswordPage />}></Route>
          <Route path="/analyze" element={<AnalyzePage />} />
          <Route path="/analyze/both" element={<BothAnalyzePage />} />
          <Route path="/analyze/stain" element={<StainAnalyzePage />} />
          <Route path="/analyze/label" element={<LabelAnalyzePage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/fabricsoftener" element={<FabricSoftenerPage />} />
          <Route
            path="/fabricsoftener/result/:categoryId"
            element={<FabricSoftenerResultPage />}
          />
          <Route path="/laundry-map" element={<NearbyLaundryPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
