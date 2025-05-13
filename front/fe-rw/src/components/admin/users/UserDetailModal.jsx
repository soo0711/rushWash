import React, { useState, useEffect } from "react";

const UserDetailModal = ({
  show,
  user,
  isEditMode,
  onClose,
  onEdit,
  onSave,
  onCancelEdit,
}) => {
  const [editedUser, setEditedUser] = useState(null);
  const [verificationStatus, setVerificationStatus] = useState({
    isVerified: false,
    verifyCode: "",
    verifiedAt: null,
  });

  // 사용자 정보가 변경될 때마다 편집 상태 초기화
  useEffect(() => {
    if (user) {
      setEditedUser({ ...user });
      // 인증 상태 설정 (실제로는 API에서 가져올 정보)
      setVerificationStatus({
        isVerified: user.is_verified || false,
        verifyCode: "123456", // 예시 코드
        verifiedAt: user.is_verified ? new Date().toISOString() : null,
      });
    }
  }, [user]);

  // 폼 입력 핸들러
  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedUser((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // 인증 상태 토글 핸들러
  const handleVerificationToggle = () => {
    if (isEditMode) {
      setEditedUser((prev) => ({
        ...prev,
        is_verified: !prev.is_verified,
      }));
    }
  };

  // 저장 핸들러
  const handleSave = () => {
    onSave(editedUser);
  };

  if (!show || !user || !editedUser) return null;

  return (
    <div className="fixed inset-0 overflow-y-auto z-50 flex items-center justify-center">
      {/* 배경 오버레이 */}
      <div
        className="fixed inset-0 bg-black opacity-50"
        onClick={isEditMode ? null : onClose}
      ></div>

      {/* 모달 콘텐츠 */}
      <div className="relative bg-white rounded-lg w-full max-w-2xl mx-auto p-6 shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">
            {isEditMode ? "사용자 정보 수정" : "사용자 상세 정보"}
          </h2>
          <button
            onClick={isEditMode ? null : onClose}
            className={`text-gray-400 hover:text-gray-500 text-2xl ${
              isEditMode ? "invisible" : ""
            }`}
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 사용자 기본 정보 */}
          <div className="space-y-4 col-span-1">
            <div>
              <label className="block text-lg font-medium text-gray-700 mb-1">
                이름
              </label>
              <input
                type="text"
                name="name"
                value={editedUser.name || ""}
                onChange={handleChange}
                disabled={!isEditMode}
                className={`w-full border ${
                  isEditMode ? "border-gray-300" : "border-gray-200 bg-gray-50"
                } rounded-md px-3 py-2 text-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
              />
            </div>

            <div>
              <label className="block text-lg font-medium text-gray-700 mb-1">
                이메일
              </label>
              <input
                type="email"
                name="email"
                value={editedUser.email || ""}
                onChange={handleChange}
                disabled={!isEditMode}
                className={`w-full border ${
                  isEditMode ? "border-gray-300" : "border-gray-200 bg-gray-50"
                } rounded-md px-3 py-2 text-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
              />
            </div>

            <div>
              <label className="block text-lg font-medium text-gray-700 mb-1">
                전화번호
              </label>
              <input
                type="tel"
                name="phone_number"
                value={editedUser.phone_number || ""}
                onChange={handleChange}
                disabled={!isEditMode}
                className={`w-full border ${
                  isEditMode ? "border-gray-300" : "border-gray-200 bg-gray-50"
                } rounded-md px-3 py-2 text-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
              />
            </div>

            <div>
              <label className="block text-lg font-medium text-gray-700 mb-1">
                가입일
              </label>
              <div className="w-full border border-gray-200 bg-gray-50 rounded-md px-3 py-2 text-lg">
                {editedUser.created_at || "N/A"}
              </div>
            </div>

            <div>
              <label className="block text-lg font-medium text-gray-700 mb-1">
                최근 업데이트
              </label>
              <div className="w-full border border-gray-200 bg-gray-50 rounded-md px-3 py-2 text-lg">
                {editedUser.updated_at || "N/A"}
              </div>
            </div>
          </div>

          {/* 인증 정보 및 추가 정보 */}
          <div className="space-y-4 col-span-1">
            <div>
              <label className="block text-lg font-medium text-gray-700 mb-1">
                인증 상태
              </label>
              <div
                className={`flex items-center ${
                  isEditMode ? "cursor-pointer" : "pointer-events-none"
                }`}
                onClick={handleVerificationToggle}
              >
                <div
                  className={`h-6 w-12 rounded-full p-1 transition-colors duration-300 ${
                    editedUser.is_verified ? "bg-green-500" : "bg-gray-300"
                  }`}
                >
                  <div
                    className={`bg-white h-4 w-4 rounded-full shadow-md transform transition-transform duration-300 ${
                      editedUser.is_verified ? "translate-x-6" : ""
                    }`}
                  ></div>
                </div>
                <span className="ml-3 text-lg">
                  {editedUser.is_verified ? "인증 완료" : "미인증"}
                </span>
              </div>
            </div>

            {verificationStatus.isVerified && (
              <>
                <div>
                  <label className="block text-lg font-medium text-gray-700 mb-1">
                    인증 코드
                  </label>
                  <div className="w-full border border-gray-200 bg-gray-50 rounded-md px-3 py-2 text-lg">
                    {verificationStatus.verifyCode}
                  </div>
                </div>

                <div>
                  <label className="block text-lg font-medium text-gray-700 mb-1">
                    인증 일시
                  </label>
                  <div className="w-full border border-gray-200 bg-gray-50 rounded-md px-3 py-2 text-lg">
                    {verificationStatus.verifiedAt
                      ? new Date(verificationStatus.verifiedAt).toLocaleString()
                      : "N/A"}
                  </div>
                </div>
              </>
            )}

            {/* 세탁 히스토리 정보 */}
            <div>
              <label className="block text-lg font-medium text-gray-700 mb-1">
                세탁 히스토리
              </label>
              <div className="w-full border border-gray-200 bg-gray-50 rounded-md px-3 py-3 text-lg">
                <div className="flex justify-between">
                  <span>총 세탁 횟수</span>
                  <span className="font-semibold">3회</span>
                </div>
                <div className="mt-2">
                  <a
                    href={`/admin/washing-history?user_id=${user.id}`}
                    className="text-blue-500 hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    히스토리 보기 →
                  </a>
                </div>
              </div>
            </div>

            {/* 메모 정보 */}
            <div>
              <label className="block text-lg font-medium text-gray-700 mb-1">
                메모
              </label>
              <textarea
                name="memo"
                value={editedUser.memo || ""}
                onChange={handleChange}
                disabled={!isEditMode}
                className={`w-full border ${
                  isEditMode ? "border-gray-300" : "border-gray-200 bg-gray-50"
                } rounded-md px-3 py-2 text-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 h-28`}
                placeholder="사용자에 대한 메모를 입력하세요"
              ></textarea>
            </div>
          </div>
        </div>

        {/* 액션 버튼 */}
        <div className="mt-8 flex justify-end space-x-3">
          {isEditMode ? (
            <>
              <button
                onClick={onCancelEdit}
                className="px-4 py-2 border border-gray-300 rounded-md text-lg text-gray-700 bg-white hover:bg-gray-50"
              >
                취소
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-500 text-white rounded-md text-lg hover:bg-blue-600"
              >
                저장
              </button>
            </>
          ) : (
            <>
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-lg text-gray-700 bg-white hover:bg-gray-50"
              >
                닫기
              </button>
              <button
                onClick={onEdit}
                className="px-4 py-2 bg-blue-500 text-white rounded-md text-lg hover:bg-blue-600"
              >
                수정
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDetailModal;
