import React, { useState, useEffect } from "react";
import AdminSidebar from "../../components/admin/AdminSidebar";

const AdminFabricSoftenerPage = () => {
  // 상태 관리
  const [fabricSofteners, setFabricSofteners] = useState([]);
  const [scentCategories, setScentCategories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentSoftener, setCurrentSoftener] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [formData, setFormData] = useState({
    scent_category: "",
    brand: "",
    product_name: "",
  });
  const [loading, setLoading] = useState(true);

  // 초기 데이터 로드 (실제로는 API 호출)
  useEffect(() => {
    // 로딩 상태 설정
    setLoading(true);

    // 섬유유연제 목록 데이터
    const dummyFabricSofteners = [
      {
        id: 1,
        scent_category: "플로럴",
        brand: "피죤",
        product_name: "섬유유연제 플로럴",
        created_at: "2025-05-01",
        updated_at: "2025-05-01",
      },
      {
        id: 2,
        scent_category: "시트러스",
        brand: "다우니",
        product_name: "퍼퓸 시트러스",
        created_at: "2025-04-22",
        updated_at: "2025-04-30",
      },
      {
        id: 3,
        scent_category: "머스크",
        brand: "샤프란",
        product_name: "샤프란 머스크",
        created_at: "2025-04-15",
        updated_at: "2025-04-15",
      },
      {
        id: 4,
        scent_category: "플로럴",
        brand: "다우니",
        product_name: "퍼퓸 플로럴",
        created_at: "2025-04-10",
        updated_at: "2025-04-10",
      },
      {
        id: 5,
        scent_category: "우디",
        brand: "유한",
        product_name: "유한 우디향",
        created_at: "2025-03-25",
        updated_at: "2025-04-05",
      },
    ];

    // 향기 카테고리 목록
    const dummyScentCategories = [
      { id: 1, name: "플로럴" },
      { id: 2, name: "시트러스" },
      { id: 3, name: "머스크" },
      { id: 4, name: "우디" },
      { id: 5, name: "프루티" },
    ];

    setFabricSofteners(dummyFabricSofteners);
    setScentCategories(dummyScentCategories);
    setLoading(false);
  }, []);

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
      scent_category: "",
      brand: "",
      product_name: "",
    });
    setIsModalOpen(true);
  };

  // 모달 열기 - 항목 수정
  const openEditModal = (softener) => {
    setCurrentSoftener(softener);
    setFormData({
      scent_category: softener.scent_category,
      brand: softener.brand,
      product_name: softener.product_name,
    });
    setIsModalOpen(true);
  };

  // 모달 닫기
  const closeModal = () => {
    setIsModalOpen(false);
  };

  // 항목 저장 (추가 또는 수정)
  const handleSave = () => {
    if (!formData.scent_category || !formData.brand || !formData.product_name) {
      alert("모든 필드를 입력해주세요.");
      return;
    }

    const now = new Date().toISOString().split("T")[0];

    if (currentSoftener) {
      // 수정
      const updatedSofteners = fabricSofteners.map((item) =>
        item.id === currentSoftener.id
          ? { ...item, ...formData, updated_at: now }
          : item
      );
      setFabricSofteners(updatedSofteners);
    } else {
      // 추가
      const newSoftener = {
        id:
          fabricSofteners.length > 0
            ? Math.max(...fabricSofteners.map((item) => item.id)) + 1
            : 1,
        ...formData,
        created_at: now,
        updated_at: now,
      };
      setFabricSofteners([...fabricSofteners, newSoftener]);
    }

    closeModal();
  };

  // 항목 삭제
  const handleDelete = (id) => {
    if (window.confirm("정말로 이 항목을 삭제하시겠습니까?")) {
      setFabricSofteners(fabricSofteners.filter((item) => item.id !== id));
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
              섬유유연제 관리
            </h1>
          </div>
        </header>

        {/* 메인 컨텐츠 */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
          {/* 필터 컴포넌트 */}
          <div className="bg-white p-4 rounded-md shadow mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i className="fas fa-search text-gray-400"></i>
                </div>
                <input
                  type="text"
                  placeholder="제품명 또는 브랜드 검색..."
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
                className="text-gray-600 hover:text-gray-800 flex items-center justify-center"
              >
                <i className="fas fa-times mr-1"></i>
                필터 초기화
              </button>
            </div>
          </div>

          {/* 제품 추가 버튼 */}
          <button
            onClick={openAddModal}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center mb-4"
          >
            <i className="fas fa-plus mr-2"></i>
            <span className="text-base">새 제품 추가</span>
          </button>

          {/* 데이터 테이블 */}
          <div className="bg-white rounded-md shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    향기 카테고리
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    브랜드
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    제품명
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    등록일
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    수정일
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    액션
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSofteners.map((softener) => (
                  <tr key={softener.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {softener.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {softener.scent_category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {softener.brand}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {softener.product_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {softener.created_at}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {softener.updated_at}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => openEditModal(softener)}
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button
                        onClick={() => handleDelete(softener.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredSofteners.length === 0 && (
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
                      {fabricSofteners.length}
                    </span>{" "}
                    항목 중{" "}
                    <span className="font-medium">
                      {filteredSofteners.length}
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

      {/* 모달 */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {currentSoftener ? "섬유유연제 수정" : "새 섬유유연제 추가"}
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    향기 카테고리
                  </label>
                  <select
                    name="scent_category"
                    value={formData.scent_category}
                    onChange={handleInputChange}
                    className="w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">카테고리 선택</option>
                    {scentCategories.map((category) => (
                      <option key={category.id} value={category.name}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    브랜드
                  </label>
                  <input
                    type="text"
                    name="brand"
                    value={formData.brand}
                    onChange={handleInputChange}
                    className="w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    제품명
                  </label>
                  <input
                    type="text"
                    name="product_name"
                    value={formData.product_name}
                    onChange={handleInputChange}
                    className="w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  취소
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
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
