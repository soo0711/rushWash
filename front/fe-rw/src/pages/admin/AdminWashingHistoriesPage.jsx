import React, { useState, useEffect } from "react";
import AdminSidebar from "../../components/admin/AdminSidebar";
import { ADMIN_WASHINGS_API, PROXY_API, useProxy } from "../../constants/api";
import axios from "axios";

const AdminWashingHistoriesPage = () => {
  // 상태 관리
  const [washingHistories, setWashingHistories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAnalysisType, setSelectedAnalysisType] = useState("");
  const [selectedUser, setSelectedUser] = useState("");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [currentHistory, setCurrentHistory] = useState(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState({ url: "", title: "" });
  const [sortConfig, setSortConfig] = useState({
    key: "createdAt",
    direction: "desc",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedHistories, setSelectedHistories] = useState([]);
  const [selectedSatisfaction, setSelectedSatisfaction] = useState("");

  //API URL 설정
  const GET_ALL = useProxy ? PROXY_API.GET_ALL : ADMIN_WASHINGS_API.GET_ALL;
  const DELETE = useProxy ? PROXY_API.DELETE : ADMIN_WASHINGS_API.DELETE;
  const GET_GOOD = useProxy ? PROXY_API.GET_GOOD : ADMIN_WASHINGS_API.GET_GOOD;

  // 초기 데이터 로드
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await axios.get(GET_ALL);
        if (response.data.success) {
          const grouped = {};
          response.data.data.forEach((item) => {
            const id = item.washingHistoryId;
            if (!grouped[id]) {
              grouped[id] = {
                id: id,
                userId: item.userId,
                userEmail: item.userEmail,
                analysisType: item.analysisType,
                stainImageUrl: item.stain_image_url,
                labelImageUrl: item.label_image_url,
                createdAt: item.createdAt,
                estimation: item.estimation,
                results: [],
              };
            }
            grouped[id].results.push({
              category: item.stainCategory,
              analysis: item.analysis,
            });
          });

          setWashingHistories(Object.values(grouped));
        } else {
          console.error(response.data.error?.message || "불러오기 실패");
          setError(
            response.data.error?.message || "데이터를 불러올 수 없습니다."
          );
        }
      } catch (err) {
        console.error("API 호출 오류:", err);
        setError("서버 오류로 데이터를 불러올 수 없습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleDelete = async (historyId) => {
    if (!window.confirm("정말로 이 분석 내역을 삭제하시겠습니까?")) return;

    try {
      const response = await axios.delete(`/api/admin/washings`, {
        data: { washingHistoryId: historyId },
      });
      if (response.data && response.data.success) {
        alert("삭제 완료되었습니다.");
        setWashingHistories((prev) =>
          prev.filter((item) => item.id !== historyId)
        );
        setSelectedHistories(
          selectedHistories.filter((id) => id !== historyId)
        );
      } else {
        alert(response.data.error?.message || "분석 내역 삭제에 실패했습니다.");
      }
    } catch (err) {
      console.error("삭제 중 오류 발생:", err);
      alert("서버 오류로 삭제하지 못했습니다.");
    }
  };

  // 선택된 내역 일괄 삭제
  const handleBulkDelete = async () => {
    if (selectedHistories.length === 0) {
      alert("삭제할 항목을 선택해주세요.");
      return;
    }

    if (
      !window.confirm(
        `선택한 ${selectedHistories.length}개 항목을 삭제하시겠습니까?`
      )
    ) {
      return;
    }

    try {
      const response = await axios.delete("/api/admin/washings/bulk", {
        data: { ids: selectedHistories },
      });

      if (response.data && response.data.success) {
        alert(`${selectedHistories.length}개 항목이 삭제되었습니다.`);
        setWashingHistories((prev) =>
          prev.filter((item) => !selectedHistories.includes(item.id))
        );
        setSelectedHistories([]);
      } else {
        alert(response.data.error?.message || "일괄 삭제에 실패했습니다.");
      }
    } catch (err) {
      console.error("일괄 삭제 중 오류 발생:", err);
      alert("서버 오류로 삭제하지 못했습니다.");
    }
  };

  // 필터링된 데이터
  const filteredHistories = washingHistories.filter((item) => {
    // 검색어 필터링
    const matchesSearch =
      item.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.analysis &&
        item.analysis.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.stainCategory &&
        item.stainCategory.toLowerCase().includes(searchTerm.toLowerCase()));

    // 분석 유형 필터링
    const matchesAnalysisType = selectedAnalysisType
      ? item.analysisType === selectedAnalysisType
      : true;

    // 사용자 필터링
    const matchesUser = selectedUser
      ? item.userId === Number(selectedUser)
      : true;

    // 날짜 범위 필터링
    const createdDate = new Date(item.createdAt);
    const startDateMatch = dateRange.start
      ? new Date(dateRange.start) <= createdDate
      : true;
    const endDateMatch = dateRange.end
      ? new Date(dateRange.end) >= createdDate
      : true;

    // 만족도 필터링
    const matchesSatisfaction =
      selectedSatisfaction === ""
        ? true
        : selectedSatisfaction === "true"
        ? item.estimation === true
        : item.estimation === false;
    return (
      matchesSearch &&
      matchesAnalysisType &&
      matchesUser &&
      matchesSatisfaction &&
      startDateMatch &&
      endDateMatch
    );
  });

  // 정렬 로직
  const sortedHistories = [...filteredHistories].sort((a, b) => {
    if (sortConfig.key === "userEmail") {
      if (a.userEmail < b.userEmail)
        return sortConfig.direction === "asc" ? -1 : 1;
      if (a.userEmail > b.userEmail)
        return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    } else if (sortConfig.key === "createdAt") {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return sortConfig.direction === "asc" ? dateA - dateB : dateB - dateA;
    } else {
      if (a[sortConfig.key] < b[sortConfig.key])
        return sortConfig.direction === "asc" ? -1 : 1;
      if (a[sortConfig.key] > b[sortConfig.key])
        return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    }
  });

  // 페이지네이션
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentHistories = sortedHistories.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredHistories.length / itemsPerPage);

  // 정렬 처리
  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // 정렬 함수 추가
  const reorderResults = (results) => {
    const stainPriority = [
      "blood",
      "coffee",
      "ink",
      "oil",
      "kimchi",
      "lipstick",
      "mustard",
      "earth",
      "wine",
    ];

    return [
      ...results.filter((r) => r.category === "guide"),
      ...results.filter((r) => stainPriority.includes(r.category)),
      ...results.filter(
        (r) => r.category !== "guide" && !stainPriority.includes(r.category)
      ),
    ];
  };

  // 정렬 방향 아이콘 표시
  const getSortIcon = (name) => {
    if (sortConfig.key !== name) return null;
    return sortConfig.direction === "asc" ? "↑" : "↓";
  };

  // 항목 선택 핸들러
  const handleSelectHistory = (id) => {
    setSelectedHistories(
      selectedHistories.includes(id)
        ? selectedHistories.filter((historyId) => historyId !== id)
        : [...selectedHistories, id]
    );
  };

  // 전체 선택/해제 핸들러
  const handleSelectAllHistories = (isChecked) => {
    if (isChecked) {
      setSelectedHistories(currentHistories.map((item) => item.id));
    } else {
      setSelectedHistories([]);
    }
  };

  // 상세 모달 열기
  const openDetailModal = (history) => {
    const reordered = reorderResults(history.results);
    setCurrentHistory({ ...history, results: reordered });
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
    setSelectedSatisfaction("");
    setDateRange({ start: "", end: "" });
  };

  // 날짜 포맷 함수
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(date.getDate()).padStart(2, "0")}`;
  };

  // 분석 유형 표시 함수
  const getAnalysisTypeText = (type) => {
    switch (type) {
      case "LABEL":
        return "라벨";
      case "STAIN":
        return "얼룩";
      case "LABEL_AND_STAIN":
        return "얼룩과 라벨";
      default:
        return type;
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

  // 에러 상태 표시
  if (error) {
    return (
      <div className="flex h-screen bg-gray-100">
        <AdminSidebar />
        <div className="flex-1 flex justify-center items-center">
          <div className="bg-white p-8 rounded-lg shadow-md">
            <p className="text-red-500 text-xl mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
            >
              다시 시도
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 상단 바 */}
        <header className="bg-white shadow-md z-10">
          <div className="flex justify-between items-center px-8 py-6">
            <h1 className="text-3xl font-semibold text-gray-800">
              분석 내역 관리
            </h1>
            <div className="flex items-center">
              {selectedHistories.length > 0 && (
                <button
                  onClick={handleBulkDelete}
                  className="flex items-center bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
                >
                  <span className="mr-2">선택 삭제</span>
                  <span className="bg-white text-red-500 rounded-full w-6 h-6 flex items-center justify-center text-sm">
                    {selectedHistories.length}
                  </span>
                </button>
              )}
            </div>
          </div>
        </header>

        {/* 메인 컨텐츠 */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
          {/* 필터 컴포넌트 */}
          <div className="bg-white p-4 rounded-md shadow mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* 검색 필터 */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="사용자 이메일 또는 분석 내용 검색..."
                  className="w-full border rounded-md p-2 pl-8 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="h-4 w-4 text-gray-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>

              {/* 분석 유형 필터 */}
              <div className="relative">
                <select
                  className="w-full border rounded-md p-2 pl-8 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={selectedAnalysisType}
                  onChange={(e) => setSelectedAnalysisType(e.target.value)}
                >
                  <option value="">모든 분석 유형</option>
                  <option value="LABEL">라벨</option>
                  <option value="STAIN">얼룩</option>
                  <option value="LABEL_AND_STAIN">얼룩과 라벨</option>
                </select>
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="h-4 w-4 text-gray-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>

              {/* 사용자 만족도 필터 */}
              <div className="relative">
                <select
                  className="w-full border rounded-md p-2 pl-8 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={selectedSatisfaction}
                  onChange={(e) => setSelectedSatisfaction(e.target.value)}
                >
                  <option value="">모든 만족도</option>
                  <option value="true">LIKE</option>
                  <option value="false">DISLIKE</option>
                </select>
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="h-4 w-4 text-gray-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>

              {/* 날짜 필터 */}
              <div className="grid grid-cols-2 gap-2">
                <div className="relative">
                  <input
                    type="date"
                    placeholder="시작일"
                    className="w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={dateRange.start}
                    onChange={(e) =>
                      setDateRange({ ...dateRange, start: e.target.value })
                    }
                  />
                </div>
                <div className="relative">
                  <input
                    type="date"
                    placeholder="종료일"
                    className="w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  <svg
                    className="h-4 w-4 mr-1"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                  필터 초기화
                </button>
              </div>
            </div>
          </div>

          {/* 데이터 테이블 */}
          <div className="bg-white rounded-md shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-lg font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort("id")}
                    >
                      <div className="flex items-center">
                        ID {getSortIcon("id")}
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-lg font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort("userEmail")}
                    >
                      <div className="flex items-center">
                        사용자 이메일 {getSortIcon("userEmail")}
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-lg font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort("analysisType")}
                    >
                      <div className="flex items-center">
                        분석 유형 {getSortIcon("analysisType")}
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-lg font-medium text-gray-500 uppercase tracking-wider"
                    >
                      사용자 만족도
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-lg font-medium text-gray-500 uppercase tracking-wider"
                    >
                      분석 결과
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-lg font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort("createdAt")}
                    >
                      <div className="flex items-center">
                        등록일 {getSortIcon("createdAt")}
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-lg font-medium text-gray-500 uppercase tracking-wider"
                    >
                      관리
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentHistories.map((history, index) => (
                    <tr
                      key={`${history.id}-${index}`}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-lg text-gray-500">
                        {history.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-lg font-medium text-gray-900">
                          {history.userEmail}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-lg leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          {getAnalysisTypeText(history.analysisType)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {history.estimation === true ? (
                          <span className="px-2 inline-flex text-lg leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            LIKE
                          </span>
                        ) : history.estimation === false ? (
                          <span className="px-2 inline-flex text-lg leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                            DISLIKE
                          </span>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="max-w-xs truncate">
                          <span className="font-semibold">
                            {history.stainCategory &&
                              `${history.stainCategory}: `}
                          </span>
                          {history.analysis}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-lg text-gray-500">
                        {formatDate(history.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-lg font-medium">
                        <button
                          onClick={() => openDetailModal(history)}
                          className="text-indigo-600 hover:text-indigo-900 mr-4"
                        >
                          상세
                        </button>
                        <button
                          onClick={() => handleDelete(history.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          삭제
                        </button>
                      </td>
                    </tr>
                  ))}
                  {currentHistories.length === 0 && (
                    <tr>
                      <td
                        colSpan="8"
                        className="px-6 py-4 text-center text-sm text-gray-500"
                      >
                        검색 결과가 없습니다.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* 페이지네이션 */}
            {totalPages > 1 && (
              <nav className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
                <div className="flex-1 flex justify-between items-center">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-lg font-medium rounded-md ${
                      currentPage === 1
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    이전
                  </button>
                  <span className="text-lg text-gray-700">
                    {currentPage} / {totalPages} 페이지
                  </span>
                  <button
                    onClick={() =>
                      setCurrentPage(Math.min(totalPages, currentPage + 1))
                    }
                    disabled={currentPage === totalPages}
                    className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-lg font-medium rounded-md ${
                      currentPage === totalPages
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    다음
                  </button>
                </div>
              </nav>
            )}
          </div>
        </main>
      </div>

      {/* 상세 정보 모달 */}
      {isDetailModalOpen &&
        currentHistory &&
        (() => {
          const groupedResults = currentHistory.results.reduce((acc, cur) => {
            if (!acc[cur.category]) acc[cur.category] = [];
            acc[cur.category].push(cur.analysis);
            return acc;
          }, {});

          return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
                {/* 모달 헤더 - 고정 */}
                <div className="p-6 border-b border-gray-200 flex-shrink-0">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium text-gray-900">
                      분석 내역 상세 정보
                    </h3>
                    <button
                      onClick={closeModal}
                      className="text-gray-400 hover:text-gray-500 text-xl"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                {/* 모달 본문 - 스크롤 가능 */}
                <div className="flex-1 overflow-y-auto p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-md font-medium text-gray-700 mb-2">
                        기본 정보
                      </h4>
                      <div className="bg-gray-50 p-4 rounded-md mb-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-sm">
                            <div className="font-medium text-gray-500">ID</div>
                            <div>{currentHistory.id}</div>
                          </div>
                          <div className="text-sm">
                            <div className="font-medium text-gray-500">
                              분석 유형
                            </div>
                            <div>{currentHistory.analysisType}</div>
                          </div>
                          <div className="text-sm">
                            <div className="font-medium text-gray-500">
                              사용자 이메일
                            </div>
                            <div>{currentHistory.userEmail}</div>
                          </div>
                          <div className="text-sm">
                            <div className="font-medium text-gray-500">
                              등록일
                            </div>
                            <div>{formatDate(currentHistory.createdAt)}</div>
                          </div>
                        </div>
                      </div>

                      <h4 className="text-md font-medium text-gray-700 mb-2">
                        분석 결과
                      </h4>
                      <div className="bg-gray-50 p-4 rounded-md space-y-4">
                        {Object.entries(groupedResults).map(
                          ([category, analyses], idx) => {
                            // 카테고리별 스타일 정의
                            const getCategoryStyle = (cat) => {
                              if (cat === "guide") {
                                return {
                                  bgColor: "bg-green-50",
                                  borderColor: "border-green-200",
                                  titleColor: "text-green-700",
                                  icon: "🤖",
                                  label: "AI 종합 가이드",
                                };
                              } else if (
                                [
                                  "blood",
                                  "coffee",
                                  "ink",
                                  "oil",
                                  "kimchi",
                                  "lipstick",
                                  "mustard",
                                  "earth",
                                  "wine",
                                ].includes(cat)
                              ) {
                                return {
                                  bgColor: "bg-red-50",
                                  borderColor: "border-red-200",
                                  titleColor: "text-red-700",
                                  icon: "💧",
                                  label: `${cat} 얼룩`,
                                };
                              } else {
                                return {
                                  bgColor: "bg-blue-50",
                                  borderColor: "border-blue-200",
                                  titleColor: "text-blue-700",
                                  icon: "🏷️",
                                  label: `${cat} 라벨`,
                                };
                              }
                            };

                            const style = getCategoryStyle(category);

                            return (
                              <div
                                key={idx}
                                className={`${style.bgColor} ${style.borderColor} border-l-4 p-4 rounded-r-md`}
                              >
                                <div className="flex items-center mb-2">
                                  <span className="text-lg mr-2">
                                    {style.icon}
                                  </span>
                                  <p
                                    className={`font-semibold ${style.titleColor} text-base`}
                                  >
                                    {style.label}
                                  </p>
                                </div>
                                <div className="ml-6">
                                  {analyses.map((text, i) => (
                                    <div
                                      key={i}
                                      className="text-gray-800 text-sm mb-2 p-2 bg-white rounded-md shadow-sm"
                                    >
                                      {text}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          }
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-md font-medium text-gray-700 mb-2">
                        이미지
                      </h4>
                      <div className="space-y-4">
                        {currentHistory.stainImageUrl && (
                          <div>
                            <div className="text-sm font-medium text-gray-500 mb-1">
                              얼룩 이미지
                            </div>
                            <div className="border rounded-md overflow-hidden">
                              <img
                                src={currentHistory.stainImageUrl}
                                alt="얼룩 이미지"
                                className="w-full object-contain"
                                style={{ maxHeight: "300px" }}
                              />
                            </div>
                          </div>
                        )}
                        {currentHistory.labelImageUrl && (
                          <div>
                            <div className="text-sm font-medium text-gray-500 mb-1">
                              라벨 이미지
                            </div>
                            <div className="border rounded-md overflow-hidden">
                              <img
                                src={currentHistory.labelImageUrl}
                                alt="라벨 이미지"
                                className="w-full object-contain"
                                style={{ maxHeight: "300px" }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 모달 푸터 - 고정 */}
                <div className="p-6 border-t border-gray-200 flex-shrink-0">
                  <div className="flex justify-end">
                    <button
                      onClick={closeModal}
                      className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors"
                    >
                      닫기
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

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
                  style={{ maxHeight: "90vh" }}
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
