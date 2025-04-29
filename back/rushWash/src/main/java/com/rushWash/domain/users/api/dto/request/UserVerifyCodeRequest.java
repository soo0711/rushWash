package com.rushWash.domain.users.api.dto.request;

public record UserVerifyCodeRequest(
        String email,
        int verifyCode
) {
}
