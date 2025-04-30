package com.rushWash.domain.users.api.dto.response;

public record UserVerifyCodeResponse(
        boolean success,
        String message,
        int userId
) {
}
