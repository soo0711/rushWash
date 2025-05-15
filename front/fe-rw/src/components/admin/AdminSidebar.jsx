import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const AdminSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;

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
  const handleLogout = () => {
    // 실제로는 API 호출 등의 로그아웃 처리
    navigate("/admin");
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
          className="flex items-center text-blue-100 hover:text-white w-full"
        >
          <i className="fas fa-sign-out-alt mr-3"></i>
          <span>로그아웃</span>
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;
