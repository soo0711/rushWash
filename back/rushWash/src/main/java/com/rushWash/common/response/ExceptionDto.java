package com.rushWash.common.response;

import org.antlr.v4.runtime.misc.NotNull;

public record ExceptionDto(
        @NotNull Integer code,
        @NotNull String message
) {
    public static ExceptionDto of(ErrorCode errorCode) {
        return new ExceptionDto(
                errorCode.getCode(),
                errorCode.getMessage()
        );
    }
}
