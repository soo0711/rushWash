package com.rushWash.domain.users.api.dto.request;

public record UserSendVerificationCodeRequest(
    String name,
    String email

) {
}
