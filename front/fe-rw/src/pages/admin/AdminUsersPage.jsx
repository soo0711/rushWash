import React, { useState, useEffect } from "react";
import AdminSidebar from "../../components/admin/AdminSidebar";
import UserTable from "../../components/admin/users/UserTable";
import UserFilter from "../../components/admin/users/UserFilter";
import UserAddModal from "../../components/admin/users/UserAddModal";
import UserDetailModal from "../../components/admin/users/UserDetailModal";

const AdminUsersPage = () => {
  // 사용자 목록 상태
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortField, setSortField] = useState("created_at");
  const [sortDirection, setSortDirection] = useState("desc");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [bulkAction, setBulkAction] = useState("");

  // 필터 상태
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    status: "all", // 'all', 'verified', 'unverified'
  });

  // 모달 상태
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  // 페이지 로드시 사용자 데이터 가져오기
  useEffect(() => {
    fetchUsers();
  }, [currentPage, sortField, sortDirection, filters, searchTerm]);

  // 사용자 데이터 가져오기 (목업 데이터)
  const fetchUsers = async () => {
    setLoading(true);
    try {
      // 실제 구현에서는 API 호출로 대체
      const mockUsers = [
        {
          id: 1,
          name: "홍길동",
          email: "hong@example.com",
          phone_number: "010-1234-5678",
          created_at: "2025-05-01",
          updated_at: "2025-05-01",
          is_verified: true,
          memo: "VIP 고객입니다.",
        },
        {
          id: 2,
          name: "김영희",
          email: "kim@example.com",
          phone_number: "010-2345-6789",
          created_at: "2025-05-02",
          updated_at: "2025-05-02",
          is_verified: true,
          memo: "",
        },
        {
          id: 3,
          name: "이철수",
          email: "lee@example.com",
          phone_number: "010-3456-7890",
          created_at: "2025-05-03",
          updated_at: "2025-05-03",
          is_verified: false,
          memo: "계정 확인 필요",
        },
        {
          id: 4,
          name: "박지민",
          email: "park@example.com",
          phone_number: "010-4567-8901",
          created_at: "2025-05-04",
          updated_at: "2025-05-04",
          is_verified: true,
          memo: "",
        },
        {
          id: 5,
          name: "최다온",
          email: "choi@example.com",
          phone_number: "010-5678-9012",
          created_at: "2025-05-05",
          updated_at: "2025-05-05",
          is_verified: false,
          memo: "연락 요망",
        },
      ];

      // 필터링 및 정렬 로직
      let filteredUsers = [...mockUsers];

      // 검색어 필터링
      if (searchTerm) {
        filteredUsers = filteredUsers.filter(
          (user) =>
            user.name.includes(searchTerm) ||
            user.email.includes(searchTerm) ||
            user.phone_number.includes(searchTerm)
        );
      }

      // 상태 필터링
      if (filters.status === "verified") {
        filteredUsers = filteredUsers.filter((user) => user.is_verified);
      } else if (filters.status === "unverified") {
        filteredUsers = filteredUsers.filter((user) => !user.is_verified);
      }

      // 정렬
      filteredUsers.sort((a, b) => {
        if (sortDirection === "asc") {
          return a[sortField] > b[sortField] ? 1 : -1;
        } else {
          return a[sortField] < b[sortField] ? 1 : -1;
        }
      });

      setUsers(filteredUsers);
      setTotalPages(Math.ceil(filteredUsers.length / 10)); // 페이지당 10명
    } catch (error) {
      console.error("사용자 데이터 로드 중 오류 발생:", error);
    } finally {
      setLoading(false);
    }
  };

  // 정렬 변경 핸들러
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  // 선택 관련 핸들러
  const handleSelectUser = (userId) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAllUsers = (checked) => {
    setSelectedUsers(checked ? users.map((user) => user.id) : []);
  };

  // 일괄 작업 핸들러
  const handleBulkAction = () => {
    if (!bulkAction || selectedUsers.length === 0) return;

    // API 호출 로직 구현
    alert(
      `${bulkAction} 작업이 ${selectedUsers.length}명의 사용자에게 적용됩니다.`
    );

    setSelectedUsers([]);
    setBulkAction("");
    fetchUsers();
  };

  // 사용자 추가 핸들러
  const handleAddUser = (userData) => {
    // API 호출 로직 구현
    alert(`새 사용자가 추가됩니다: ${userData.name}, ${userData.email}`);
    setShowAddModal(false);
    fetchUsers();
  };

  // 사용자 상세 모달 관련 핸들러
  const handleViewUser = (user) => {
    setSelectedUser(user);
    setIsEditMode(false);
    setShowDetailModal(true);
  };

  const handleEditUser = () => {
    setIsEditMode(true);
  };

  const handleUpdateUser = (updatedUser) => {
    // API 호출 로직 구현
    alert(`사용자 ID: ${updatedUser.id}의 정보가 업데이트됩니다.`);

    // 사용자 목록 업데이트
    setUsers((prev) =>
      prev.map((user) =>
        user.id === updatedUser.id
          ? {
              ...updatedUser,
              updated_at: new Date().toISOString().split("T")[0],
            }
          : user
      )
    );

    setIsEditMode(false);
  };

  const handleDeleteUser = (userId) => {
    if (window.confirm("이 사용자를 삭제하시겠습니까?")) {
      // API 호출 로직 구현
      alert(`사용자 ID: ${userId}가 삭제됩니다.`);
      fetchUsers();
    }
  };

  // 로딩 상태 표시
  if (loading) {
    return (
      <div className="flex h-screen bg-gray-100">
        <AdminSidebar />
        <div className="flex-1 flex justify-center items-center">
          <p className="text-xl">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 상단 바 */}
        <header className="bg-white shadow-sm z-10">
          <div className="flex justify-between items-center px-6 py-4">
            <h1 className="text-2xl font-semibold text-gray-800">
              사용자 관리
            </h1>
          </div>
        </header>

        {/* 메인 컨텐츠 */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
          {/* 필터 컴포넌트 */}
          <UserFilter
            filters={filters}
            setFilters={setFilters}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            bulkAction={bulkAction}
            setBulkAction={setBulkAction}
            selectedUsers={selectedUsers}
            handleBulkAction={handleBulkAction}
          />

          {/* 사용자 추가 버튼 */}
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center text-xl mb-4"
          >
            <i className="fas fa-plus mr-2"></i>사용자 추가
          </button>

          {/* 사용자 테이블 컴포넌트 */}
          <UserTable
            users={users}
            selectedUsers={selectedUsers}
            sortField={sortField}
            sortDirection={sortDirection}
            currentPage={currentPage}
            totalPages={totalPages}
            onSort={handleSort}
            onSelectUser={handleSelectUser}
            onSelectAllUsers={handleSelectAllUsers}
            onViewUser={handleViewUser}
            onDeleteUser={handleDeleteUser}
            setCurrentPage={setCurrentPage}
          />
        </main>
      </div>

      {/* 모달 컴포넌트 */}
      <UserAddModal
        show={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddUser}
      />

      <UserDetailModal
        show={showDetailModal}
        user={selectedUser}
        isEditMode={isEditMode}
        onClose={() => setShowDetailModal(false)}
        onEdit={handleEditUser}
        onSave={handleUpdateUser}
        onCancelEdit={() => setIsEditMode(false)}
      />
    </div>
  );
};

export default AdminUsersPage;
