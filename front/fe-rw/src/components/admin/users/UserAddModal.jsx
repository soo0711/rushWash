import React, { useState } from "react";

const UserAddModal = ({ show, onClose, onAdd }) => {
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    phone_number: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 입력 변경 핸들러
  const handleChange = (e) => {
    const { name, value } = e.target;

    // 전화번호 필드에 대한 특별 처리 (하이픈 자동 추가)
    if (name === "phone_number") {
      const formattedNumber = formatPhoneNumber(value);
      setNewUser((prev) => ({
        ...prev,
        [name]: formattedNumber,
      }));
    } else {
      setNewUser((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    // 에러 상태 초기화
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  // 전화번호 형식 포맷팅 (하이픈 추가)
  const formatPhoneNumber = (value) => {
    // 숫자만 남기기
    const numbers = value.replace(/[^\d]/g, "");

    // 형식에 맞게 하이픈 추가
    if (numbers.length <= 3) {
      return numbers;
    } else if (numbers.length <= 7) {
      return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    } else {
      return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(
        7,
        11
      )}`;
    }
  };

  // 폼 유효성 검사
  const validateForm = () => {
    const newErrors = {};

    // 이름 검사
    if (!newUser.name.trim()) {
      newErrors.name = "이름을 입력해주세요";
    }

    // 이메일 검사
    if (!newUser.email.trim()) {
      newErrors.email = "이메일을 입력해주세요";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newUser.email)) {
      newErrors.email = "유효한 이메일 형식이 아닙니다";
    }

    // 전화번호 검사
    if (!newUser.phone_number) {
      newErrors.phone_number = "전화번호를 입력해주세요";
    } else {
      const cleanNumber = newUser.phone_number.replace(/-/g, "");
      if (cleanNumber.length < 10 || cleanNumber.length > 11) {
        newErrors.phone_number = "유효한 전화번호 형식이 아닙니다";
      }
    }

    // 비밀번호 검사
    if (!newUser.password.trim()) {
      newErrors.password = "비밀번호를 입력해주세요";
    } else if (newUser.password.length < 8) {
      newErrors.password = "비밀번호는 최소 8자 이상이어야 합니다";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 폼 제출 핸들러
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // API 요청에 맞게 데이터 변환
      // 하이픈이 있는 전화번호를 그대로 전달 (API 호출 시 처리됨)
      await onAdd(newUser);

      // 폼 초기화
      setNewUser({
        name: "",
        email: "",
        phone_number: "",
        password: "",
      });
      setErrors({});
    } catch (error) {
      console.error("사용자 추가 중 오류:", error);
      // 서버에서 반환된 특정 오류가 있는 경우 처리
      if (error.response?.data?.error) {
        const serverError = error.response.data.error;
        // 필드별 오류 처리
        if (serverError.field) {
          setErrors({
            ...errors,
            [serverError.field]: serverError.message,
          });
        } else {
          // 일반 오류 처리
          alert(
            `오류: ${serverError.message || "사용자 추가에 실패했습니다."}`
          );
        }
      } else {
        // 기타 오류
        alert("사용자 추가 중 오류가 발생했습니다.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // 모달 닫기
  const handleClose = () => {
    // 제출 중이 아닌 경우에만 닫기
    if (!isSubmitting) {
      // 폼 초기화
      setNewUser({
        name: "",
        email: "",
        phone_number: "",
        password: "",
      });
      setErrors({});
      onClose();
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 overflow-y-auto z-50 flex items-center justify-center">
      <div
        className="fixed inset-0 bg-black opacity-50"
        onClick={handleClose}
      ></div>

      <div className="relative bg-white rounded-lg max-w-md w-full mx-auto p-6 shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">새 사용자 추가</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-500 text-xl"
            disabled={isSubmitting}
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
                className={`w-full border ${
                  errors.name ? "border-red-500" : "border-gray-300"
                } rounded-md px-3 py-2 text-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                value={newUser.name}
                onChange={handleChange}
                disabled={isSubmitting}
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-lg font-medium text-gray-700 mb-1">
                이메일
              </label>
              <input
                type="email"
                name="email"
                className={`w-full border ${
                  errors.email ? "border-red-500" : "border-gray-300"
                } rounded-md px-3 py-2 text-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                value={newUser.email}
                onChange={handleChange}
                disabled={isSubmitting}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-lg font-medium text-gray-700 mb-1">
                전화번호
              </label>
              <input
                type="tel"
                name="phone_number"
                placeholder="ex) 010-1234-5678"
                className={`w-full border ${
                  errors.phone_number ? "border-red-500" : "border-gray-300"
                } rounded-md px-3 py-2 text-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                value={newUser.phone_number}
                onChange={handleChange}
                disabled={isSubmitting}
              />
              {errors.phone_number && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.phone_number}
                </p>
              )}
            </div>

            <div>
              <label className="block text-lg font-medium text-gray-700 mb-1">
                비밀번호
              </label>
              <input
                type="password"
                name="password"
                className={`w-full border ${
                  errors.password ? "border-red-500" : "border-gray-300"
                } rounded-md px-3 py-2 text-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                value={newUser.password}
                onChange={handleChange}
                disabled={isSubmitting}
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password}</p>
              )}
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md text-lg hover:bg-gray-300"
              disabled={isSubmitting}
            >
              취소
            </button>
            <button
              type="submit"
              className={`px-4 py-2 ${
                isSubmitting ? "bg-blue-400" : "bg-blue-500 hover:bg-blue-600"
              } text-white rounded-md text-lg`}
              disabled={isSubmitting}
            >
              {isSubmitting ? "처리 중..." : "추가"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserAddModal;
