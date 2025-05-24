import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { USER_API, useProxy, PROXY_API } from "../../constants/api";

const AdminSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // API URL 설정
  const SIGN_OUT_URL = useProxy ? PROXY_API.SIGN_OUT : USER_API.SIGN_OUT;

  // 현재 경로에 따라 활성화된 메뉴 결정
  const isActive = (path) => {
    return currentPath === path || currentPath.startsWith(`${path}/`);
  };

  // 사이드바 메뉴 항목 컴포넌트
  const SidebarMenuItem = ({ icon, title, path }) => (
    <li>
      <Link
        to={path}
        className={`flex items-center py-3 px-4 ${
          isActive(path)
            ? "bg-blue-700 text-white"
            : "text-blue-100 hover:bg-blue-700 hover:text-white"
        } transition-colors duration-200`}
      >
        <span className="mr-3">{icon}</span>
        <span>{title}</span>
      </Link>
    </li>
  );

  // 로그아웃 처리
  const handleLogout = async () => {
    if (isLoggingOut) return; // 중복 요청 방지

    try {
      setIsLoggingOut(true);

      const token = localStorage.getItem("accessToken");

      // 로그아웃 API 호출
      const response = await axios.post(
        SIGN_OUT_URL,
        {},
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
        }
      );

      // API 호출 성공/실패와 관계없이 로컬 스토리지 정리
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("userData");

      if (response.data.success) {
        alert("로그아웃되었습니다.");
      } else {
        // API는 실패했지만 로컬 데이터는 정리됨
        console.warn("로그아웃 API 실패:", response.data.error);
        alert("로그아웃되었습니다.");
      }

      // 관리자 로그인 페이지로 이동
      navigate("/");
    } catch (error) {
      console.error("로그아웃 요청 실패:", error);

      // API 요청이 실패해도 로컬 스토리지는 정리
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("userData");

      alert("로그아웃되었습니다.");
      navigate("/");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="w-64 bg-blue-800 text-white shadow-lg h-full flex flex-col">
      <div className="p-4 border-b border-blue-700">
        <div className="flex items-center justify-center">
          <h1 className="text-2xl font-bold">
            <span className="text-blue-300">빨랑</span>
            <span className="text-white">빨래</span>
          </h1>
        </div>
        <div className="text-center text-blue-200 mt-1">관리자 페이지</div>
      </div>

      <nav className="mt-5 flex-grow overflow-y-auto">
        <ul>
          <SidebarMenuItem
            icon={<i className="fas fa-tachometer-alt"></i>}
            title="대시보드"
            path="/admin/dashboard"
          />

          {/* 사용자 관리 */}
          <li className="mt-6 px-4">
            <h2 className="text-xl text-blue-400 font-semibold uppercase tracking-wider">
              사용자 관리
            </h2>
          </li>
          <SidebarMenuItem
            icon={<i className="fas fa-users"></i>}
            title="사용자 목록"
            path="/admin/users"
          />
          {/* 
          <SidebarMenuItem
            icon={<i className="fas fa-user-shield"></i>}
            title="관리자 계정"
            path="/admin/admins"
          />*/}

          {/* 섬유유연제 관리 */}
          <li className="mt-6 px-4">
            <h2 className="text-xl text-blue-400 font-semibold uppercase tracking-wider">
              섬유유연제 관리
            </h2>
          </li>
          <SidebarMenuItem
            icon={<i className="fas fa-shopping-basket"></i>}
            title="제품 목록"
            path="/admin/fabric-softeners"
          />
          {/*
          <SidebarMenuItem
            icon={<i className="fas fa-tags"></i>}
            title="향기 카테고리"
            path="/admin/scent-categories"
          /> */}

          {/* 얼룩 세탁법 내역 관리 */}
          <li className="mt-6 px-4">
            <h2 className="text-xl text-blue-400 font-semibold uppercase tracking-wider">
              얼룩 세탁법 관리
            </h2>
          </li>
          <SidebarMenuItem
            icon={<i className="fas fa-history"></i>}
            title="얼룩 세탁법 내역"
            path="/admin/stain-removal"
          />

          {/* 분석 관리 */}
          <li className="mt-6 px-4">
            <h2 className="text-xl text-blue-400 font-semibold uppercase tracking-wider">
              분석 관리
            </h2>
          </li>
          <SidebarMenuItem
            icon={<i className="fas fa-history"></i>}
            title="분석 내역"
            path="/admin/washing-histories"
          />

          {/* AI 관리 */}
          <li className="mt-6 px-4">
            <h2 className="text-xl text-blue-400 font-semibold uppercase tracking-wider">
              AI 관리
            </h2>
          </li>
          <SidebarMenuItem
            icon={<i className="fas fa-ai"></i>}
            title="AI 성능 및 관리"
            path="/admin/ai"
          />
        </ul>
      </nav>

      <div className="border-t border-blue-700 p-4">
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="flex items-center text-blue-100 hover:text-white w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <i
            className={`fas ${
              isLoggingOut ? "fa-spinner fa-spin" : "fa-sign-out-alt"
            } mr-3`}
          ></i>
          <span>{isLoggingOut ? "로그아웃 중..." : "로그아웃"}</span>
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;
