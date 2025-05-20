package com.rushWash.common.exception;

import com.rushWash.common.response.ApiResponse;
import com.rushWash.common.response.CustomException;
import com.rushWash.common.response.ErrorCode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.NoHandlerFoundException;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    // 존재하지 않는 요청에 대한 예외 처리
    @ExceptionHandler({NoHandlerFoundException.class, HttpRequestMethodNotSupportedException.class})
    public ResponseEntity<ApiResponse<?>> handleNoPageFoundException(Exception e) {
        logger.error("handleNoPageFoundException - {}", e.getMessage(), e);

        ApiResponse<?> response = ApiResponse.fail(ErrorCode.NOT_FOUND_END_POINT);
        return ResponseEntity.status(ErrorCode.NOT_FOUND_END_POINT.getHttpStatus())
                             .body(response);
    }

    // 커스텀 예외 처리
    @ExceptionHandler(CustomException.class)
    public ResponseEntity<ApiResponse<?>> handleCustomException(CustomException e) {
        logger.error("handleCustomException - {}", e.getMessage(), e);

        ApiResponse<?> response = ApiResponse.fail(e.getErrorCode());
        return ResponseEntity.status(e.getErrorCode().getHttpStatus())
                             .body(response);
    }

    // 그 외 모든 예외 처리 (500 에러)
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<?>> handleException(Exception e) {
        logger.error("handleException - {}", e.getMessage(), e);

        ApiResponse<?> response = ApiResponse.fail(ErrorCode.INTERNAL_SERVER_ERROR);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                             .body(response);
    }
}
