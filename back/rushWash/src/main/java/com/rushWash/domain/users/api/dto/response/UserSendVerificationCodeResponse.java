package com.rushWash.domain.users.api.dto.response;

import com.rushWash.domain.verification.domain.Verification;
public record UserSendVerificationCodeResponse(
        boolean success,
        String message,
        int verifyCode

) {
}
