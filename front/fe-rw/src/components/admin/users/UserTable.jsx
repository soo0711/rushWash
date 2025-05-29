import React from "react";

const UserTable = ({
  users,
  selectedUsers,
  sortField,
  sortDirection,
  currentPage,
  totalPages,
  onSort,
  onSelectUser,
  onSelectAllUsers,
  onViewUser,
  onDeleteUser,
  setCurrentPage,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-lg font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => onSort("id")}
              >
                ID
                {sortField === "id" && (
                  <span className="ml-1">
                    {sortDirection === "asc" ? "↑" : "↓"}
                  </span>
                )}
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-lg font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => onSort("name")}
              >
                이름
                {sortField === "name" && (
                  <span className="ml-1">
                    {sortDirection === "asc" ? "↑" : "↓"}
                  </span>
                )}
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-lg font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => onSort("email")}
              >
                이메일
                {sortField === "email" && (
                  <span className="ml-1">
                    {sortDirection === "asc" ? "↑" : "↓"}
                  </span>
                )}
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-lg font-medium text-gray-500 uppercase tracking-wider"
              >
                전화번호
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-lg font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => onSort("created_at")}
              >
                가입일
                {sortField === "created_at" && (
                  <span className="ml-1">
                    {sortDirection === "asc" ? "↑" : "↓"}
                  </span>
                )}
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-right text-lg font-medium text-gray-500 uppercase tracking-wider"
              >
                관리
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-xl font-medium text-gray-900">
                  {user.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-xl font-medium text-gray-900">
                  {user.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-xl text-gray-500">
                  {user.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-xl text-gray-500">
                  {user.phone_number}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-xl text-gray-500">
                  {user.created_at}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-xl font-medium">
                  <button
                    onClick={() => onViewUser(user)}
                    className="text-blue-600 hover:text-blue-900 mr-3"
                  >
                    상세
                  </button>
                  <button
                    className="text-red-600 hover:text-red-900"
                    onClick={() => onDeleteUser(user.id)}
                  >
                    삭제
                  </button>
                </td>
              </tr>
            ))}
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
  );
};

export default UserTable;
