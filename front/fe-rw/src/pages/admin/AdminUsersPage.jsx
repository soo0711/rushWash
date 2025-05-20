import React, { useState, useEffect } from "react";
import axios from "axios";
import AdminSidebar from "../../components/admin/AdminSidebar";
import UserTable from "../../components/admin/users/UserTable";
import UserFilter from "../../components/admin/users/UserFilter";
import UserAddModal from "../../components/admin/users/UserAddModal";
import UserDetailModal from "../../components/admin/users/UserDetailModal";
import { ADMIN_USERS_API, PROXY_API, useProxy } from "../../constants/api";

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
  const [processingBulkAction, setProcessingBulkAction] = useState(false);

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

  // API URL 설정
  const USERS_API_URL = useProxy
    ? PROXY_API.ADMIN_USERS.GET_ALL
    : ADMIN_USERS_API.GET_ALL;

  const DELETE_URL = useProxy
    ? PROXY_API.ADMIN_USERS.DELETE
    : ADMIN_USERS_API.DELETE;

  // 페이지 로드시 사용자 데이터 가져오기
  useEffect(() => {
    fetchUsers();
  }, [currentPage, sortField, sortDirection, filters, searchTerm]);

  // 사용자 데이터 가져오기 (실제 API 호출)
  const fetchUsers = async () => {
    setLoading(true);
    try {
      console.log("사용자 목록 요청 URL:", USERS_API_URL);
      // GET /admin/users 엔드포인트 호출
      const response = await axios.get(USERS_API_URL);

      console.log("사용자 목록 응답:", response.data);

      if (response.data && response.data.success) {
        // 필터링 및 정렬 로직
        let filteredUsers = [...response.data.data];

        // 검색어 필터링
        if (searchTerm) {
          filteredUsers = filteredUsers.filter(
            (user) =>
              (user.name && user.name.includes(searchTerm)) ||
              (user.email && user.email.includes(searchTerm)) ||
              (user.phoneNumber && user.phoneNumber.includes(searchTerm))
          );
        }

        // 상태 필터링 - 해당 필드가 API 응답에 있는 경우에만
        if (
          filters.status === "verified" &&
          "isVerified" in (filteredUsers[0] || {})
        ) {
          filteredUsers = filteredUsers.filter((user) => user.isVerified);
        } else if (
          filters.status === "unverified" &&
          "isVerified" in (filteredUsers[0] || {})
        ) {
          filteredUsers = filteredUsers.filter((user) => !user.isVerified);
        }

        // 정렬 가능한 필드 확인
        // API 응답의 필드명 확인 (camelCase)
        const firstUser = filteredUsers[0] || {};
        const apiSortField =
          sortField === "created_at"
            ? "createdAt"
            : sortField === "updated_at"
            ? "updatedAt"
            : sortField;

        // 정렬 (API 응답에 해당 필드가 있는 경우에만)
        if (apiSortField in firstUser) {
          filteredUsers.sort((a, b) => {
            if (sortDirection === "asc") {
              return a[apiSortField] > b[apiSortField] ? 1 : -1;
            } else {
              return a[apiSortField] < b[apiSortField] ? 1 : -1;
            }
          });
        }

        // API 응답에 맞게 변수명 조정 (카멜 케이스 -> 스네이크 케이스)
        const formattedUsers = filteredUsers.map((user) => ({
          id: user.id,
          name: user.name || "",
          email: user.email || "",
          phone_number: user.phoneNumber || "", // 전화번호는 하이픈 유지
          created_at: user.createdAt || new Date().toISOString().split("T")[0],
          updated_at: user.updatedAt || new Date().toISOString().split("T")[0],
          is_verified: user.isVerified !== undefined ? user.isVerified : false, // isVerified 필드가 있는 경우
          memo: user.memo || "",
        }));

        setUsers(formattedUsers);
        setTotalPages(Math.ceil(formattedUsers.length / 10)); // 페이지당 10명
      } else {
        // API가 success: false를 반환한 경우
        throw new Error(
          response.data.error?.message ||
            "사용자 데이터를 불러오는데 실패했습니다."
        );
      }
    } catch (error) {
      console.error("사용자 데이터 로드 중 오류 발생:", error);
      alert(
        `사용자 데이터를 불러오는데 실패했습니다. ${
          error.response?.data?.error?.message || error.message
        }`
      );
      // 오류 발생 시 빈 배열로 설정
      setUsers([]);
      setTotalPages(1);
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

  // 단일 사용자 삭제
  const deleteUser = async (userId) => {
    try {
      console.log("사용자 삭제 요청 데이터:", { userId });
      const response = await axios.delete(DELETE_URL, {
        data: {
          userId: userId,
        },
      });

      if (response.data && response.data.success) {
        return true;
      } else {
        throw new Error(
          response.data.error?.message || "사용자 삭제에 실패했습니다."
        );
      }
    } catch (error) {
      console.error(`사용자 ID ${userId} 삭제 중 오류:`, error);
      return false;
    }
  };

  // 일괄 작업 핸들러 (개선된 버전)
  const handleBulkAction = async () => {
    if (!bulkAction || selectedUsers.length === 0 || processingBulkAction)
      return;

    if (
      window.confirm(
        `선택한 ${selectedUsers.length}명의 사용자를 ${
          bulkAction === "delete" ? "삭제" : "처리"
        }하시겠습니까?`
      )
    ) {
      setProcessingBulkAction(true);
      let processedCount = 0;
      let failedCount = 0;

      try {
        if (bulkAction === "delete") {
          // 먼저 일괄 삭제를 시도
          try {
            console.log("일괄 삭제 요청 데이터:", { userIds: selectedUsers });
            const response = await axios.delete(DELETE_URL, {
              data: {
                userIds: selectedUsers,
              },
            });

            if (response.data && response.data.success) {
              alert(`${selectedUsers.length}명의 사용자가 삭제되었습니다.`);
              setSelectedUsers([]);
              setBulkAction("");
              fetchUsers();
              setProcessingBulkAction(false);
              return;
            }
          } catch (bulkError) {
            console.error("일괄 삭제 실패, 개별 삭제 시도 중:", bulkError);

            // 일괄 삭제가 실패하면 개별 사용자 삭제를 시도
            const totalUsers = selectedUsers.length;
            for (const userId of selectedUsers) {
              const success = await deleteUser(userId);
              if (success) {
                processedCount++;
              } else {
                failedCount++;
              }

              // 진행 상황 업데이트 (25%, 50%, 75%)
              if (
                processedCount % Math.ceil(totalUsers / 4) === 0 ||
                processedCount + failedCount === totalUsers
              ) {
                console.log(
                  `진행 상황: ${processedCount}/${totalUsers} 완료, ${failedCount} 실패`
                );
              }
            }
          }
        } else if (bulkAction === "verify" || bulkAction === "unverify") {
          // 인증 관련 API가 구현되지 않았으므로 알림
          alert("이 작업은 현재 지원되지 않습니다.");
          setProcessingBulkAction(false);
          return;
        }

        if (processedCount > 0) {
          alert(
            `${processedCount}명의 사용자가 성공적으로 처리되었습니다. ${
              failedCount > 0 ? `(${failedCount}명 실패)` : ""
            }`
          );
          setSelectedUsers([]);
          setBulkAction("");
          fetchUsers();
        } else if (failedCount > 0) {
          alert(`모든 작업이 실패했습니다. 다시 시도해주세요.`);
        }
      } catch (error) {
        console.error("일괄 작업 중 오류 발생:", error);
        alert(
          `작업 중 오류가 발생했습니다. ${
            error.response?.data?.error?.message || error.message
          }`
        );
      } finally {
        setProcessingBulkAction(false);
      }
    }
  };

  // 사용자 추가 핸들러
  const handleAddUser = async (userData) => {
    try {
      // POST /admin/users 엔드포인트 호출
      const POST_URL = useProxy
        ? PROXY_API.ADMIN_USERS.GET_ALL // POST 전용 엔드포인트가 없어 GET_ALL을 사용
        : ADMIN_USERS_API.GET_ALL;

      // API 요청 데이터 준비 (password 필드 제외, 전화번호 하이픈 유지)
      const requestData = {
        name: userData.name,
        email: userData.email,
        phoneNumber: userData.phone_number, // 하이픈 유지
      };

      console.log("사용자 추가 요청 데이터:", requestData);
      const response = await axios.post(POST_URL, requestData);

      console.log("사용자 추가 응답:", response.data);

      if (response.data && response.data.success) {
        alert(`새 사용자가 추가되었습니다: ${userData.name}`);
        setShowAddModal(false);
        fetchUsers();
      } else {
        // API가 success: false를 반환한 경우
        throw new Error(
          response.data.error?.message || "사용자 추가에 실패했습니다."
        );
      }
    } catch (error) {
      console.error("사용자 추가 중 오류 발생:", error);
      alert(
        `사용자 추가 중 오류가 발생했습니다. ${
          error.response?.data?.error?.message || error.message
        }`
      );
    }
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

  // 사용자 정보 업데이트 핸들러
  const handleUpdateUser = async (updatedUser) => {
    try {
      // PATCH 또는 PUT /admin/users 엔드포인트 호출
      const UPDATE_URL = useProxy
        ? PROXY_API.ADMIN_USERS.UPDATE
        : ADMIN_USERS_API.UPDATE;

      // API 요청 데이터 준비 (전화번호 하이픈 유지)
      const requestData = {
        userId: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        phoneNumber: updatedUser.phone_number, // 하이픈 유지
      };

      console.log("사용자 업데이트 요청 데이터:", requestData);
      const response = await axios.patch(UPDATE_URL, requestData);

      console.log("사용자 업데이트 응답:", response.data);

      if (response.data && response.data.success) {
        alert(`사용자 정보가 업데이트되었습니다.`);

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
      } else {
        // API가 success: false를 반환한 경우
        throw new Error(
          response.data.error?.message || "사용자 정보 업데이트에 실패했습니다."
        );
      }
    } catch (error) {
      console.error("사용자 정보 업데이트 중 오류 발생:", error);
      alert(
        `사용자 정보 업데이트 중 오류가 발생했습니다. ${
          error.response?.data?.error?.message || error.message
        }`
      );
    }
  };

  // 사용자 삭제 핸들러
  const handleDeleteUser = async (userId) => {
    if (window.confirm("이 사용자를 삭제하시겠습니까?")) {
      try {
        // DELETE /admin/users 엔드포인트 호출
        const success = await deleteUser(userId);

        if (success) {
          alert(`사용자가 삭제되었습니다.`);
          fetchUsers();
        } else {
          throw new Error("사용자 삭제에 실패했습니다.");
        }
      } catch (error) {
        console.error("사용자 삭제 중 오류 발생:", error);
        alert(
          `사용자 삭제 중 오류가 발생했습니다. ${
            error.response?.data?.error?.message || error.message
          }`
        );
      }
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

          {/* 제품 추가 버튼 */}
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md flex items-center mb-6 text-lg font-medium transition duration-200"
          >
            <svg
              className="h-6 w-6 mr-2"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
            <span>새 사용자 추가</span>
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
