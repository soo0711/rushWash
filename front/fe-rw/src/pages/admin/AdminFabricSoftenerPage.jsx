import React, { useState, useEffect } from "react";
import axios from "axios";
import AdminSidebar from "../../components/admin/AdminSidebar";
import {
  ADMIN_FABRIC_SOFTENER_API,
  PROXY_API,
  useProxy,
} from "../../constants/api";

// API 요청에 사용할 인스턴스 생성 (필요시 인터셉터 추가를 위해)
const apiClient = axios.create();

// 에러 응답 처리를 위한 헬퍼 함수
const handleApiError = (error) => {
  console.error("API 오류:", error);

  if (error.response) {
    // 서버가 응답을 반환한 경우 (4xx, 5xx)
    return `${error.response.status} 오류: ${
      error.response.data?.error?.message || "알 수 없는 오류가 발생했습니다."
    }`;
  } else if (error.request) {
    // 요청은 이루어졌지만 응답이 없는 경우
    return "서버에서 응답이 없습니다. 네트워크 연결을 확인해주세요.";
  } else {
    // 요청 설정 중 오류가 발생한 경우
    return `요청 오류: ${error.message}`;
  }
};

const AdminFabricSoftenerPage = () => {
  // 상태 관리
  const [fabricSofteners, setFabricSofteners] = useState([]);
  const [scentCategories, setScentCategories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentSoftener, setCurrentSoftener] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [formData, setFormData] = useState({
    scentCategory: "",
    brand: "",
    productName: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // API URL 설정
  const API_URL = useProxy
    ? PROXY_API.ADMIN_FABRIC_SOFTENER.GET_ALL
    : ADMIN_FABRIC_SOFTENER_API.GET_ALL;

  const CREATE_URL = useProxy
    ? PROXY_API.ADMIN_FABRIC_SOFTENER.CREATE
    : ADMIN_FABRIC_SOFTENER_API.CREATE;

  const DELETE_URL = useProxy
    ? PROXY_API.ADMIN_FABRIC_SOFTENER.DELETE
    : ADMIN_FABRIC_SOFTENER_API.DELETE;

  const UPDATE_URL = useProxy
    ? PROXY_API.ADMIN_FABRIC_SOFTENER.UPDATE
    : ADMIN_FABRIC_SOFTENER_API.UPDATE;

  // 데이터 로드 (API 호출)
  useEffect(() => {
    fetchFabricSofteners();
  }, []);

  // 섬유유연제 데이터 가져오기 (조회 API)
  const fetchFabricSofteners = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log("섬유유연제 목록 요청 URL:", API_URL);
      const response = await apiClient.get(API_URL);
      console.log("섬유유연제 목록 응답:", response.data);

      if (response.data && response.data.success) {
        // API 응답에서 데이터 추출
        const apiData = response.data.data || [];

        // 카멜케이스 -> 스네이크케이스 변환
        const formattedData = apiData.map((item) => ({
          id: item.id,
          scent_category: item.scentCategory || "",
          brand: item.brand || "",
          product_name: item.productName || "",
          created_at: item.createdAt || new Date().toISOString().split("T")[0],
          updated_at: item.updatedAt || new Date().toISOString().split("T")[0],
        }));

        setFabricSofteners(formattedData);

        // 향기 카테고리 추출 (중복 제거)
        const categories = [
          ...new Set(formattedData.map((item) => item.scent_category)),
        ]
          .filter(Boolean)
          .map((name, index) => ({ id: index + 1, name }));

        setScentCategories(categories);
      } else {
        throw new Error(
          response.data.error?.message || "데이터를 불러오는데 실패했습니다."
        );
      }
    } catch (err) {
      console.error("섬유유연제 데이터 로드 중 오류 발생:", err);
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  // 필터링된 데이터
  const filteredSofteners = fabricSofteners.filter((item) => {
    const matchesSearch =
      item.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.brand.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory
      ? item.scent_category === selectedCategory
      : true;
    return matchesSearch && matchesCategory;
  });

  // 폼 입력 처리
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // 모달 열기 - 새 항목 추가
  const openAddModal = () => {
    setCurrentSoftener(null);
    setFormData({
      scentCategory: "",
      brand: "",
      productName: "",
      imageFile: null,
    });
    setIsModalOpen(true);
  };

  // 모달 열기 - 항목 수정
  const openEditModal = (softener) => {
    setCurrentSoftener(softener);
    setFormData({
      scentCategory: softener.scent_category,
      brand: softener.brand,
      productName: softener.product_name,
    });
    setIsModalOpen(true);
  };

  // 모달 닫기
  const closeModal = () => {
    setIsModalOpen(false);
  };

  // 항목 저장 (추가 또는 수정)
  const handleSave = async () => {
    if (!formData.scentCategory || !formData.brand || !formData.productName) {
      alert("모든 필드를 입력해주세요.");
      return;
    }

    try {
      if (currentSoftener) {
        // 수정 API 호출 (PATCH)
        console.log("섬유유연제 수정 요청 데이터:", {
          fabricSoftenerId: currentSoftener.id,
          ...formData,
        });

        const response = await apiClient.patch(UPDATE_URL, {
          fabricSoftenerId: currentSoftener.id,
          scentCategory: formData.scentCategory,
          brand: formData.brand,
          productName: formData.productName,
        });

        console.log("섬유유연제 수정 응답:", response.data);

        if (response.data && response.data.success) {
          alert("섬유유연제가 성공적으로 수정되었습니다.");
          closeModal();
          fetchFabricSofteners(); // 데이터 새로고침
        } else {
          throw new Error(
            response.data.error?.message || "섬유유연제 수정에 실패했습니다."
          );
        }
      } else {
        // 추가 API 호출 (POST)
        console.log("섬유유연제 추가 요청 데이터:", formData);

        const formDataToSend = new FormData();
        formDataToSend.append("request", new Blob(
          [JSON.stringify({
            scentCategory: formData.scentCategory,
            brand: formData.brand,
            productName: formData.productName,
          })], { type: "application/json" }
        ));
        formDataToSend.append("file", formData.imageFile);

        const response = await apiClient.post(CREATE_URL, formDataToSend, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        console.log("섬유유연제 추가 응답:", response.data);

        if (response.data && response.data.success) {
          alert("새 섬유유연제가 성공적으로 추가되었습니다.");
          closeModal();
          fetchFabricSofteners(); // 데이터 새로고침
        } else {
          throw new Error(
            response.data.error?.message || "섬유유연제 추가에 실패했습니다."
          );
        }
      }
    } catch (err) {
      console.error("섬유유연제 저장 중 오류 발생:", err);
      alert("오류가 발생했습니다: " + handleApiError(err));
    }
  };

  // 항목 삭제 API 호출 (DELETE)
  const handleDelete = async (id) => {
    if (window.confirm("정말로 이 항목을 삭제하시겠습니까?")) {
      try {
        console.log("섬유유연제 삭제 요청 데이터:", { fabricSoftenerId: id });

        const response = await apiClient.delete(DELETE_URL, {
          data: {
            fabricSoftenerId: id,
          },
        });

        console.log("섬유유연제 삭제 응답:", response.data);

        if (response.data && response.data.success) {
          alert("섬유유연제가 성공적으로 삭제되었습니다.");
          fetchFabricSofteners(); // 데이터 새로고침
        } else {
          throw new Error(
            response.data.error?.message || "섬유유연제 삭제에 실패했습니다."
          );
        }
      } catch (err) {
        console.error("섬유유연제 삭제 중 오류 발생:", err);
        alert("오류가 발생했습니다: " + handleApiError(err));
      }
    }
  };

  // 필터 초기화
  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("");
  };

  // 로딩 상태 표시
  if (loading) {
    return (
      <div className="flex h-screen bg-gray-100">
        <AdminSidebar />
        <div className="flex-1 flex justify-center items-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-2xl mt-6 text-gray-700">로딩 중...</p>
          </div>
        </div>
      </div>
    );
  }

  // 오류 상태 표시
  if (error) {
    return (
      <div className="flex h-screen bg-gray-100">
        <AdminSidebar />
        <div className="flex-1 flex justify-center items-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-8 py-6 rounded-lg max-w-lg w-full">
            <p className="text-2xl font-semibold mb-4">오류가 발생했습니다</p>
            <p className="text-lg mb-6">{error}</p>
            <button
              onClick={fetchFabricSofteners}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-md transition duration-200 text-lg font-medium"
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
              섬유유연제 관리
            </h1>
          </div>
        </header>

        {/* 메인 컨텐츠 */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-8">
          {/* 필터 컴포넌트 */}
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="h-6 w-6 text-gray-400"
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
                <input
                  type="text"
                  placeholder="제품명 또는 브랜드 검색..."
                  className="pl-12 w-full border rounded-md p-3 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="h-6 w-6 text-gray-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <select
                  className="pl-12 w-full border rounded-md p-3 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="">모든 향기 카테고리</option>
                  {scentCategories.map((category) => (
                    <option key={category.id} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={clearFilters}
                className="text-gray-600 hover:text-gray-800 flex items-center justify-center text-lg"
              >
                <svg
                  className="h-6 w-6 mr-2"
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

          {/* 제품 추가 버튼 */}
          <button
            onClick={openAddModal}
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
            <span>새 제품 추가</span>
          </button>

          {/* 데이터 테이블 */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      className="px-6 py-3 text-left text-lg font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => {
                        // ID 기준 정렬 기능 추가 가능
                      }}
                    >
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-lg font-medium text-gray-500 uppercase tracking-wider">
                      향기 카테고리
                    </th>
                    <th
                      className="px-6 py-3 text-left text-lg font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => {
                        // 브랜드 기준 정렬 기능 추가 가능
                      }}
                    >
                      브랜드
                    </th>
                    <th
                      className="px-6 py-3 text-left text-lg font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => {
                        // 제품명 기준 정렬 기능 추가 가능
                      }}
                    >
                      제품명
                    </th>
                    <div>
                    <label className="block text-lg font-medium text-gray-700 mb-2">
                      제품 사진
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setFormData({ ...formData, imageFile: e.target.files[0] })}
                      className="w-full border rounded-md p-3 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                    <th
                      className="px-6 py-3 text-left text-lg font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => {
                        // 등록일 기준 정렬 기능 추가 가능
                      }}
                    >
                      등록일
                    </th>
                    <th className="px-6 py-3 text-left text-lg font-medium text-gray-500 uppercase tracking-wider">
                      수정일
                    </th>
                    <th className="px-6 py-3 text-right text-lg font-medium text-gray-500 uppercase tracking-wider">
                      관리
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredSofteners.length > 0 ? (
                    filteredSofteners.map((softener) => (
                      <tr key={softener.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-xl font-medium text-gray-900">
                          {softener.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 inline-flex text-sm leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            {softener.scent_category}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-xl font-medium text-gray-900">
                          {softener.brand}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-xl text-gray-900">
                          {softener.product_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-xl text-gray-500">
                          {softener.created_at}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-xl text-gray-500">
                          {softener.updated_at}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-xl font-medium">
                          <button
                            onClick={() => openEditModal(softener)}
                            className="text-blue-600 hover:text-blue-900 mr-3"
                          >
                            수정
                          </button>
                          <button
                            onClick={() => handleDelete(softener.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            삭제
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="7"
                        className="px-6 py-4 text-center text-xl text-gray-500"
                      >
                        검색 결과가 없습니다.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* 페이지네이션 (UserTable 스타일 적용) */}
            <nav className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
              <div className="flex-1 flex justify-between items-center">
                <button
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-lg font-medium rounded-md bg-white text-gray-700 hover:bg-gray-50"
                  onClick={() => {
                    // 이전 페이지 기능 추가 가능
                  }}
                >
                  이전
                </button>
                <span className="text-lg text-gray-700">
                  전체{" "}
                  <span className="font-medium">{fabricSofteners.length}</span>{" "}
                  항목 중{" "}
                  <span className="font-medium">
                    {filteredSofteners.length}
                  </span>{" "}
                  항목 표시
                </span>
                <button
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-lg font-medium rounded-md bg-white text-gray-700 hover:bg-gray-50"
                  onClick={() => {
                    // 다음 페이지 기능 추가 가능
                  }}
                >
                  다음
                </button>
              </div>
            </nav>
          </div>
        </main>
      </div>
      {/* 모달 */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">
                {currentSoftener ? "섬유유연제 수정" : "새 섬유유연제 추가"}
              </h3>

              <div className="space-y-6">
                <div>
                  <label className="block text-lg font-medium text-gray-700 mb-2">
                    향기 카테고리
                  </label>
                  <input
                    type="text"
                    name="scentCategory"
                    value={formData.scentCategory}
                    onChange={handleInputChange}
                    className="w-full border rounded-md p-3 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    placeholder="예: 플로럴, 시트러스, 머스크"
                  />
                </div>

                <div>
                  <label className="block text-lg font-medium text-gray-700 mb-2">
                    브랜드
                  </label>
                  <input
                    type="text"
                    name="brand"
                    value={formData.brand}
                    onChange={handleInputChange}
                    className="w-full border rounded-md p-3 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    placeholder="예: 피죤, 다우니, 샤프란"
                  />
                </div>

                <div>
                  <label className="block text-lg font-medium text-gray-700 mb-2">
                    제품명
                  </label>
                  <input
                    type="text"
                    name="productName"
                    value={formData.productName}
                    onChange={handleInputChange}
                    className="w-full border rounded-md p-3 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    placeholder="예: 제품의 전체 이름"
                  />
                </div>
              </div>

              <div className="mt-8 flex justify-end space-x-4">
                <button
                  onClick={closeModal}
                  className="px-6 py-3 border border-gray-300 rounded-md shadow-sm text-lg font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-200"
                >
                  취소
                </button>
                <button
                  onClick={handleSave}
                  className="px-6 py-3 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-200"
                >
                  저장
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminFabricSoftenerPage;
