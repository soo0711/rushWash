package com.rushWash.common.response;

import org.springframework.http.HttpStatus;

public enum ErrorCode {
    // 404 Not Found
    NOT_FOUND_END_POINT(404, HttpStatus.NOT_FOUND, "존재하지 않는 API입니다."),
    USER_NOT_FOUND(404, HttpStatus.NOT_FOUND, "사용자 정보를 찾을 수 없습니다."),

    WASHING_HISTORY_NOT_FOUNT(404, HttpStatus.NOT_FOUND, "세탁 분석 내역을 찾을 수 없습니다."),
    FABRIC_CATEGORY_NOT_FOUND(404, HttpStatus.NOT_FOUND, "향기 카테고리를 찾을 수 없습니다."),
    NOT_FOUND_STAIN(404, HttpStatus.NOT_FOUND, "해당 얼룩이 존재하지 않습니다."),
    NOT_FOUND_METHOD(404, HttpStatus.NOT_FOUND, "해당 얼룩에는 세탁 방법이 없습니다."),
    // 403 Forbidden
    Forbidden(403, HttpStatus.FORBIDDEN, "접속 권한이 없습니다."),
    NO_EDIT_PERMISSION(403, HttpStatus.FORBIDDEN, "권한이 없습니다."),

    // 400 Bad Request
    BAD_REQUEST(400, HttpStatus.BAD_REQUEST, "잘못된 요청입니다."),
    DUPLICATE_PHONE_NUMBER(400, HttpStatus.BAD_REQUEST, "이미 사용 중인 전화번호입니다."),
    DUPLICATE_EMAIL(400, HttpStatus.BAD_REQUEST, "이미 사용 중인 이메일입니다."),
    INVALID_VERIFICATION_CODE(400, HttpStatus.BAD_REQUEST, "인증번호가 일치하지 않습니다"),

    // 파이썬 이미지
    STAIN_IMAGE_REUPLOAD(400, HttpStatus.BAD_REQUEST, "얼룩이 명확하게 보이도록 다시 촬영해 주세요."),
    LABEL_IMAGE_REUPLOAD(400, HttpStatus.BAD_REQUEST, "라벨이 명확하게 보이도록 다시 촬영해 주세요."),

    STAIN_LABEL_IMAGE_REUPLOAD(400, HttpStatus.BAD_REQUEST, "얼룩과 라벨이 명확하게 보이도록 다시 촬영해 주세요."),

    // 파일
    INVALID_FILE_NAME(400, HttpStatus.BAD_REQUEST, "유효하지 않은 파일 이름입니다."),

    // 500 Internal Server Error
    FILE_UPLOAD_FAILED(500, HttpStatus.INTERNAL_SERVER_ERROR, "파일 업로드에 실패했습니다."),
    FILE_DELETE_FAILED(500, HttpStatus.INTERNAL_SERVER_ERROR, "파일 삭제에 실패했습니다."),
    DIRECTORY_DELETE_FAILED(500, HttpStatus.INTERNAL_SERVER_ERROR, "디렉토리 삭제에 실패했습니다."),
    INTERNAL_SERVER_ERROR(500, HttpStatus.INTERNAL_SERVER_ERROR, "서버 내부 오류입니다."),
    NO_SUCH_ALGORITHM(500, HttpStatus.INTERNAL_SERVER_ERROR, "지원하지 않는 암호화 알고리즘입니다."),
    DATABASE_ERROR(500, HttpStatus.INTERNAL_SERVER_ERROR, "데이터베이스 처리 중 오류가 발생했습니다."),
    MAIL_SEND_FAILED(500, HttpStatus.INTERNAL_SERVER_ERROR, "메일 전송에 실패했습니다."),
    // Kakao OAuth 관련
    KAKAO_API_ERROR(500, HttpStatus.INTERNAL_SERVER_ERROR, "카카오 API 호출 중 오류가 발생했습니다."),
    INVALID_ACCESS_TOKEN(401, HttpStatus.UNAUTHORIZED, "유효하지 않은 카카오 액세스 토큰입니다."),

    // JWT
    SIGNATURE_GENERATION_FAILED(500, HttpStatus.INTERNAL_SERVER_ERROR, "JWT 서명 생성 중 오류가 발생했습니다."),
    TOKEN_PARSING_FAILED(400, HttpStatus.BAD_REQUEST, "JWT 토큰 파싱 중 오류가 발생했습니다."),
    INVALID_TOKEN(401, HttpStatus.UNAUTHORIZED, "로그인이 만료되었거나 유효하지 않은 토큰입니다. 다시 로그인해주세요."),
    EXPIRED_TOKEN(401, HttpStatus.UNAUTHORIZED, "JWT 토큰이 만료되었습니다."),
    TOKEN_USERID_EXTRACTION_FAILED(500, HttpStatus.INTERNAL_SERVER_ERROR, "JWT 토큰에서 사용자 ID 추출 중 오류가 발생했습니다."),
    TOKEN_EMAIL_EXTRACTION_FAILED(500, HttpStatus.INTERNAL_SERVER_ERROR, "JWT 토큰에서 이메일 추출 중 오류가 발생했습니다."),
    JSON_CONVERT_FAILED(500, HttpStatus.INTERNAL_SERVER_ERROR, "JWT 생성 중 JSON 변환 오류가 발생했습니다."),

    // 파일 관련 에러 코드
    FILE_SAVE_FAILED(500, HttpStatus.INTERNAL_SERVER_ERROR, "파일 저장에 실패했습니다."),
    DIRECTORY_CREATION_FAILED(500, HttpStatus.INTERNAL_SERVER_ERROR,"파일 저장 디렉토리 생성에 실패했습니다."),

    // 파이썬 실행 관련 에러 코드
    PYTHON_SCRIPT_EXECUTION_FAILED(500, HttpStatus.INTERNAL_SERVER_ERROR, "파이썬 스크립트 실행에 실패했습니다."),
    PYTHON_SCRIPT_OUTPUT_INVALID(500, HttpStatus.INTERNAL_SERVER_ERROR, "파이썬 스크립트 출력이 유효하지 않습니다."),

    // JSON 파싱 관련 에러 코드
    JSON_PARSING_FAILED(500, HttpStatus.INTERNAL_SERVER_ERROR, "JSON 파싱에 실패했습니다.");


    private final Integer code;
    private final HttpStatus httpStatus;
    private final String message;

    ErrorCode(Integer code, HttpStatus httpStatus, String message){
        this.code = code;
        this.httpStatus = httpStatus;
        this.message = message;
    }

    public Integer getCode() {
        return code;
    }

    public HttpStatus getHttpStatus() {
        return httpStatus;
    }

    public String getMessage() {
        return message;
    }
}
