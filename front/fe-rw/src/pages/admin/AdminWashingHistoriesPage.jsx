import React, { useState, useEffect } from "react";
import AdminSidebar from "../../components/admin/AdminSidebar";
import { ADMIN_WASHINGS_API, PROXY_API, useProxy } from "../../constants/api";
import axios from "axios";

const AdminWashingHistoriesPage = () => {
  // 상태 관리
  const [washingHistories, setWashingHistories] = useState([]);
  const [analysisTypes, setAnalysisTypes] = useState([]);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAnalysisType, setSelectedAnalysisType] = useState("");
  const [selectedUser, setSelectedUser] = useState("");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [currentHistory, setCurrentHistory] = useState(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState({ url: "", title: "" });
  const [loading, setLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState({
    key: "created_at",
    direction: "desc",
  });

  //API URL 설정
  const GET_ALL = useProxy ? PROXY_API.GET_ALL : ADMIN_WASHINGS_API.GET_ALL;
  const DELETE = useProxy ? PROXY_API.DELETE : ADMIN_WASHINGS_API.DELETE;
  const GET_GOOD = useProxy ? PROXY_API.GET_GOOD : ADMIN_WASHINGS_API.GET_GOOD;
  

  // 초기 데이터 로드 (실제로는 API 호출)
  useEffect(() => {
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(GET_ALL);
      if (response.data.success) {
        const apiData = response.data.data.map((item) => ({
          id: item.washingHistoryId,
          user_id: item.userId,
          user_email : item.userEmail,
          analysis_type: item.analysisType === "LABEL" ? "섬유 분석" : "얼룩 분석",
          stain_image_url: item.stain_image_url,
          label_image_url: item.label_image_url,
          estimation: item.estimation,
          created_at: item.createdAt.split("T")[0],
          updated_at: item.createdAt.split("T")[0],
          result: {
            stain_category: item.stainCategory,
            analysis: item.analysis,
          },
          user: { id: item.userId, name: `${item.userEmail}`, phone_number: "010-0000-0000" },
        }));
        setWashingHistories(apiData);
      } else {
        console.error(response.data.error?.message || "불러오기 실패");
      }
    } catch (err) {
      console.error("API 호출 오류:", err);
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, []);

  const handleDelete = async (historyId) => {
    if (!window.confirm("정말로 이 분석 내역을 삭제하시겠습니까?")) return;

    try {
      const response = await axios.delete(DELETE, {
        data: { washingHistoryId: historyId },
      });

      if (response.data && response.data.success) {
        alert(response.data.data || "삭제 완료되었습니다.");
        setWashingHistories((prev) =>
          prev.filter((item) => item.id !== historyId)
        );
      } else {
        alert(
          response.data.error?.message || "분석 내역 삭제에 실패했습니다."
        );
      }
    } catch (err) {
      console.error("삭제 중 오류 발생:", err);
      alert("서버 오류로 삭제하지 못했습니다.");
    }
  };
  // 필터링된 데이터
  const filteredHistories = washingHistories.filter((item) => {
    const matchesSearch =
      item.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.result?.analysis &&
        item.result.analysis.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesAnalysisType = selectedAnalysisType
      ? item.analysis_type === selectedAnalysisType
      : true;

    const matchesUser = selectedUser
      ? item.user_id === Number(selectedUser)
      : true;

    const createdDate = new Date(item.created_at);
    const startDateMatch = dateRange.start
      ? new Date(dateRange.start) <= createdDate
      : true;
    const endDateMatch = dateRange.end
      ? new Date(dateRange.end) >= createdDate
      : true;

    return (
      matchesSearch &&
      matchesAnalysisType &&
      matchesUser &&
      startDateMatch &&
      endDateMatch
    );
  });

  // 정렬 로직
  const sortedHistories = [...filteredHistories].sort((a, b) => {
    if (sortConfig.key === "user") {
      if (a.user.name < b.user.name)
        return sortConfig.direction === "asc" ? -1 : 1;
      if (a.user.name > b.user.name)
        return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    } else {
      if (a[sortConfig.key] < b[sortConfig.key])
        return sortConfig.direction === "asc" ? -1 : 1;
      if (a[sortConfig.key] > b[sortConfig.key])
        return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    }
  });

  // 정렬 처리
  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // 정렬 방향 아이콘 표시
  const getSortIcon = (name) => {
    if (sortConfig.key !== name) return null;
    return sortConfig.direction === "asc" ? (
      <i className="fas fa-sort-up ml-1"></i>
    ) : (
      <i className="fas fa-sort-down ml-1"></i>
    );
  };

  // 상세 모달 열기
  const openDetailModal = (history) => {
    setCurrentHistory(history);
    setIsDetailModalOpen(true);
  };

  // 이미지 모달 열기
  const openImageModal = (url, title) => {
    setCurrentImage({ url, title });
    setIsImageModalOpen(true);
  };

  // 모달 닫기
  const closeModal = () => {
    setIsDetailModalOpen(false);
    setIsImageModalOpen(false);
  };

  // 필터 초기화
  const clearFilters = () => {
    setSearchTerm("");
    setSelectedAnalysisType("");
    setSelectedUser("");
    setDateRange({ start: "", end: "" });
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
              분석 내역 관리
            </h1>
          </div>
        </header>

        {/* 메인 컨텐츠 */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
          {/* 필터 컴포넌트 */}
          <div className="bg-white p-4 rounded-md shadow mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i className="fas fa-search text-gray-400"></i>
                </div>
                <input
                  type="text"
                  placeholder="사용자 이름 또는 분석 내용 검색..."
                  className="pl-10 w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i className="fas fa-filter text-gray-400"></i>
                </div>
                <select
                  className="pl-10 w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={selectedAnalysisType}
                  onChange={(e) => setSelectedAnalysisType(e.target.value)}
                >
                  <option value="">모든 분석 유형</option>
                  {analysisTypes.map((type) => (
                    <option key={type.id} value={type.name}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i className="fas fa-user text-gray-400"></i>
                </div>
                <select
                  className="pl-10 w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                >
                  <option value="">모든 사용자</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.phone_number})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <i className="fas fa-calendar text-gray-400"></i>
                  </div>
                  <input
                    type="date"
                    placeholder="시작일"
                    className="pl-10 w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={dateRange.start}
                    onChange={(e) =>
                      setDateRange({ ...dateRange, start: e.target.value })
                    }
                  />
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <i className="fas fa-calendar text-gray-400"></i>
                  </div>
                  <input
                    type="date"
                    placeholder="종료일"
                    className="pl-10 w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={dateRange.end}
                    onChange={(e) =>
                      setDateRange({ ...dateRange, end: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="md:col-span-4 flex justify-end">
                <button
                  onClick={clearFilters}
                  className="text-gray-600 hover:text-gray-800 flex items-center"
                >
                  <i className="fas fa-times mr-1"></i>
                  필터 초기화
                </button>
              </div>
            </div>
          </div>

          {/* 데이터 테이블 */}
          <div className="bg-white rounded-md shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort("id")}
                  >
                    <div className="flex items-center">
                      ID {getSortIcon("id")}
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort("user")}
                  >
                    <div className="flex items-center">
                      사용자 이메일 {getSortIcon("user")}
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort("analysis_type")}
                  >
                    <div className="flex items-center">
                      분석 유형 {getSortIcon("analysis_type")}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    이미지
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    분석 결과
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort("created_at")}
                  >
                    <div className="flex items-center">
                      등록일 {getSortIcon("created_at")}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    액션
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedHistories.map((history) => (
                  <tr key={history.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {history.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {history.user.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {history.user.phone_number}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {history.analysis_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <button
                          onClick={() =>
                            openImageModal(
                              history.stain_image_url,
                              "얼룩 이미지"
                            )
                          }
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <i className="fas fa-image"></i>
                        </button>
                        <button
                          onClick={() =>
                            openImageModal(
                              history.label_image_url,
                              "라벨 이미지"
                            )
                          }
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <i className="fas fa-tag"></i>
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="max-w-xs truncate">
                        <span className="font-semibold">
                          {history.result?.stain_category}:
                        </span>{" "}
                        {history.result?.analysis}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {history.created_at}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => openDetailModal(history)}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                    >
                      <i className="fas fa-eye"></i> 상세
                    </button>
                    <button
                      onClick={() => handleDelete(history.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <i className="fas fa-trash"></i> 삭제
                    </button>
                  </td>
                  </tr>
                ))}
                {filteredHistories.length === 0 && (
                  <tr>
                    <td
                      colSpan="7"
                      className="px-6 py-4 text-center text-sm text-gray-500"
                    >
                      검색 결과가 없습니다.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* 페이지네이션 (간단한 구현) */}
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    전체{" "}
                    <span className="font-medium">
                      {washingHistories.length}
                    </span>{" "}
                    항목 중{" "}
                    <span className="font-medium">
                      {filteredHistories.length}
                    </span>{" "}
                    항목 표시
                  </p>
                </div>
                <div>
                  <nav
                    className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                    aria-label="Pagination"
                  >
                    <a
                      href="#"
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                    >
                      이전
                    </a>
                    <a
                      href="#"
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      1
                    </a>
                    <a
                      href="#"
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                    >
                      다음
                    </a>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* 상세 정보 모달 */}
      {isDetailModalOpen && currentHistory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  분석 내역 상세 정보
                </h3>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-md font-medium text-gray-700 mb-2">
                    기본 정보
                  </h4>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-sm">
                        <div className="font-medium text-gray-500">ID</div>
                        <div>{currentHistory.id}</div>
                      </div>
                      <div className="text-sm">
                        <div className="font-medium text-gray-500">
                          분석 유형
                        </div>
                        <div>{currentHistory.analysis_type}</div>
                      </div>
                      <div className="text-sm">
                        <div className="font-medium text-gray-500">사용자 이메일</div>
                        <div>{currentHistory.user.name}</div>
                      </div>
                      <div className="text-sm">
                        <div className="font-medium text-gray-500">연락처</div>
                        <div>{currentHistory.user.phone_number}</div>
                      </div>
                      <div className="text-sm">
                        <div className="font-medium text-gray-500">등록일</div>
                        <div>{currentHistory.created_at}</div>
                      </div>
                      <div className="text-sm">
                        <div className="font-medium text-gray-500">수정일</div>
                        <div>{currentHistory.updated_at}</div>
                      </div>
                    </div>
                  </div>

                  <h4 className="text-md font-medium text-gray-700 mt-4 mb-2">
                    분석 결과
                  </h4>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <div className="text-sm mb-2">
                      <div className="font-medium text-gray-500">카테고리</div>
                      <div>{currentHistory.result?.stain_category}</div>
                    </div>
                    <div className="text-sm">
                      <div className="font-medium text-gray-500">분석 내용</div>
                      <div className="whitespace-pre-line">
                        {currentHistory.result?.analysis}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-md font-medium text-gray-700 mb-2">
                    이미지
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <div className="text-sm font-medium text-gray-500 mb-1">
                        얼룩 이미지
                      </div>
                      <div className="border rounded-md overflow-hidden">
                        <img
                          src={currentHistory.stain_image_url}
                          alt="얼룩 이미지"
                          className="w-full h-40 object-cover"
                        />
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-500 mb-1">
                        라벨 이미지
                      </div>
                      <div className="border rounded-md overflow-hidden">
                        <img
                          src={currentHistory.label_image_url}
                          alt="라벨 이미지"
                          className="w-full h-40 object-cover"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={closeModal}
                  className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300"
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 이미지 모달 */}
      {isImageModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
            <div className="p-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-medium text-gray-900">
                  {currentImage.title}
                </h3>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
              <div className="border rounded-md overflow-hidden">
                <img
                  src={currentImage.url}
                  alt={currentImage.title}
                  className="w-full object-contain"
                  style={{ maxHeight: "70vh" }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminWashingHistoriesPage;
