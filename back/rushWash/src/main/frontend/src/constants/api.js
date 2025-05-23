// src/constants/api.js

// 기본 API URL
export const BASE_URL = "http://localhost:8080";

// 설정 (프록시 사용 시)
export const useProxy = false; // true로 설정하면 상대 경로 사용

export const ADMIN_API = {
  DASHBOARD: `${BASE_URL}/api/admin/dashboard`
}

// 사용자 관련 API
export const USER_API = {
  // 기존 사용자 관련 엔드포인트
  SIGNUP: `${BASE_URL}/users/signup`,
  SIGN_IN: `${BASE_URL}/users/sign-in`,
  SIGN_OUT: `${BASE_URL}/users/sign-out`,
  DUPLICATE_CHECK: `${BASE_URL}/users/duplicate-check`,
  VERIFY_CODE_CHECK: `${BASE_URL}/users/verify-code/check`,
  VERIFY_CODE: `${BASE_URL}/users/verify-code`,
  PASSWORD_UPDATE: `${BASE_URL}/users/password`,
  EMAIL_FIND: `${BASE_URL}/users/email`,
};

// 관리자 얼룩 제거제 관련 API
export const ADMIN_STAIN_REMOVAL_API = {
  GET_ALL: `${BASE_URL}/admin/stain-removal`,
  CREATE: `${BASE_URL}/admin/stain-removal`,
  DELETE: `${BASE_URL}/admin/stain-removal`,
  UPDATE: `${BASE_URL}/admin/stain-removal`,
};

// 관리자 섬유유연제 관련 API
export const ADMIN_FABRIC_SOFTENER_API = {
  GET_ALL: `${BASE_URL}/admin/fabric-softeners`,
  CREATE: `${BASE_URL}/admin/fabric-softeners`,
  DELETE: `${BASE_URL}/admin/fabric-softeners`,
  UPDATE: `${BASE_URL}/admin/fabric-softeners`,
};

// 세탁 관련 API
export const WASHING_API = {
  GET_BY_ID: `${BASE_URL}/washings/{washingHistoryId}`,
  UPDATE_BY_ID: `${BASE_URL}/washings`,
  GET_ALL: `${BASE_URL}/washings`,
};

// 관리자 사용자 관련 API
export const ADMIN_USERS_API = {
  GET_ALL: `${BASE_URL}/admin/users`,
  DELETE: `${BASE_URL}/admin/users`,
  UPDATE: `${BASE_URL}/admin/users`,
};

// 섬유유연제 향기 관련 API
export const FABRIC_SOFTENER_API = {
  GET_BY_SCENT: `${BASE_URL}/fabric-softeners/{fabricScent}`,
};

// 관리자 세탁 관련 API
export const ADMIN_WASHINGS_API = {
  GET_ALL: `${BASE_URL}/admin/washings`,
  DELETE: `${BASE_URL}/admin/washings`,
  GET_GOOD: `${BASE_URL}/admin/washings/good`,
};


// 사용자 분석석 관련 API
export const ANALYSIS_API = {
  STAIN: `${BASE_URL}/analysis/stain`,
  LABEL: `${BASE_URL}/analysis/label`,
  STAIN_LABEL: `${BASE_URL}/analysis/stain-label`,
};

// 프록시 환경에서 사용할 경로 (package.json에 "proxy": "http://localhost:8080" 설정 필요)
export const PROXY_API = {
  // 기존 사용자 관련 엔드포인트
  SIGNUP: "/users/signup",
  SIGN_IN: "/users/sign-in",
  SIGN_OUT: "/users/sign-out",
  DUPLICATE_CHECK: "/users/duplicate-check",
  VERIFY_CODE_GET: "/users/verify-code",
  VERIFY_CODE_POST: "/users/verify-code",
  PASSWORD_UPDATE: "/users/password",
  EMAIL_FIND: "/users/email",

  // 관리자 얼룩 제거제 관련 API
  ADMIN_STAIN_REMOVAL: {
    GET_ALL: "/admin/stain-removal",
    CREATE: "/admin/stain-removal",
    DELETE: "/admin/stain-removal",
    UPDATE: "/admin/stain-removal",
  },

  // 관리자 섬유유연제 관련 API
  ADMIN_FABRIC_SOFTENER: {
    GET_ALL: "/admin/fabric-softeners",
    CREATE: "/admin/fabric-softeners",
    DELETE: "/admin/fabric-softeners",
    UPDATE: "/admin/fabric-softeners",
  },

  // 세탁 관련 API
  WASHING: {
    GET_BY_ID: "/washings/{washingHistoryId}",
    UPDATE_BY_ID: "/washings/{washingHistoryId}",
    GET_ALL: "/washings",
  },

  // 관리자 사용자 관련 API
  ADMIN_USERS: {
    GET_ALL: "/admin/users",
    DELETE: "/admin/users",
    UPDATE: "/admin/users",
  },

  // 섬유유연제 향기 관련 API
  FABRIC_SOFTENER: {
    GET_BY_SCENT: "/fabric-softeners/{fabricScent}",
  },

  // 관리자 세탁 관련 API
  ADMIN_WASHINGS: {
    GET_ALL: "/admin/washings",
    DELETE: "/admin/washings",
    GET_GOOD: "/admin/washings/good",
  },
};

// API URL 선택 함수
export const getApiUrl = (apiPath) => {
  return useProxy ? apiPath : apiPath;
};

// 파라미터가 있는 URL 생성 함수
export const getUrlWithParam = (baseUrl, paramName, paramValue) => {
  return baseUrl.replace(`{${paramName}}`, paramValue);
};
