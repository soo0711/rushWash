import React, { useState } from "react";

const UserAddModal = ({ show, onClose, onAdd }) => {
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    phone_number: "",
    password: "",
    is_verified: false,
    memo: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewUser((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd(newUser);
    // 폼 초기화
    setNewUser({
      name: "",
      email: "",
      phone_number: "",
      password: "",
      is_verified: false,
      memo: "",
    });
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 overflow-y-auto z-50 flex items-center justify-center">
      <div
        className="fixed inset-0 bg-black opacity-50"
        onClick={onClose}
      ></div>

      <div className="relative bg-white rounded-lg max-w-md w-full mx-auto p-6 shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">새 사용자 추가</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 text-xl"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-lg font-medium text-gray-700 mb-1">
                이름
              </label>
              <input
                type="text"
                name="name"
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={newUser.name}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-lg font-medium text-gray-700 mb-1">
                이메일
              </label>
              <input
                type="email"
                name="email"
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={newUser.email}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-lg font-medium text-gray-700 mb-1">
                전화번호
              </label>
              <input
                type="tel"
                name="phone_number"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={newUser.phone_number}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-lg font-medium text-gray-700 mb-1">
                비밀번호
              </label>
              <input
                type="password"
                name="password"
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={newUser.password}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-lg font-medium text-gray-700 mb-1">
                인증 상태
              </label>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="is_verified"
                  className="rounded text-blue-600 focus:ring-blue-500 h-5 w-5"
                  checked={newUser.is_verified}
                  onChange={(e) =>
                    setNewUser({ ...newUser, is_verified: e.target.checked })
                  }
                />
                <span className="ml-2">인증됨</span>
              </div>
            </div>

            <div>
              <label className="block text-lg font-medium text-gray-700 mb-1">
                메모
              </label>
              <textarea
                name="memo"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 h-20"
                value={newUser.memo}
                onChange={handleChange}
                placeholder="사용자에 대한 메모를 입력하세요"
              ></textarea>
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-md text-lg hover:bg-blue-600"
            >
              추가
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserAddModal;
