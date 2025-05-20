import React from "react";

const UserFilter = ({
  filters,
  setFilters,
  searchTerm,
  setSearchTerm,
  bulkAction,
  setBulkAction,
  selectedUsers,
  handleBulkAction,
}) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
          {/* 일괄 작업 */}
          <div className="md:ml-4">
            <label className="block text-lg font-medium text-gray-700 mb-1">
              일괄 작업
            </label>
            <div className="flex">
              <select
                className="text-lg border border-gray-300 rounded-l-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={bulkAction}
                onChange={(e) => setBulkAction(e.target.value)}
              >
                <option value="">작업 선택</option>
                <option value="delete">삭제</option>
              </select>
              <button
                className={`text-lg px-3 py-2 rounded-r-md ${
                  !bulkAction || selectedUsers.length === 0
                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                    : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                }`}
                onClick={handleBulkAction}
                disabled={!bulkAction || selectedUsers.length === 0}
              >
                적용
              </button>
            </div>
          </div>
        </div>

        {/* 검색 */}
        <div className="w-full md:w-auto">
          <label className="block text-lg font-medium text-gray-700 mb-1">
            검색
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="이름, 이메일, 전화번호 검색"
              className="text-lg border border-gray-300 rounded-md pl-10 pr-4 py-2 w-full md:w-64 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <i className="fas fa-search text-gray-400"></i>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserFilter;
