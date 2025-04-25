package com.rushWash.common.exception;

import com.rushWash.common.response.ApiResponse;
import com.rushWash.common.response.CustomException;
import com.rushWash.common.response.ErrorCode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.NoHandlerFoundException;

@RestControllerAdvice
public class GlobalExceptionHandler {
    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    // 존재하지 않는 요청에 대한 예외
    @ExceptionHandler(value = {NoHandlerFoundException.class, HttpRequestMethodNotSupportedException.class})
    public ApiResponse<?> handleNoPageFoundException(Exception e) {
        logger.error("handleNoPageFoundException - {}", e.getMessage(), e);
        return ApiResponse.fail(ErrorCode.NOT_FOUND_END_POINT);
    }

    // 커스텀 예외
    @ExceptionHandler(value = {CustomException.class})
    public ApiResponse<?> handleCustomException(CustomException e) {
        logger.error("handleCustomException - {}", e.getMessage(), e);
        return ApiResponse.fail(e.getErrorCode());
    }

    // 기본 예외
    @ExceptionHandler(value = {Exception.class})
    public ApiResponse<?> handleException(Exception e) {
        logger.error("handleException - {}", e.getMessage(), e);
        e.printStackTrace();
        return ApiResponse.fail(ErrorCode.INTERNAL_SERVER_ERROR);
    }
}
