package com.rushWash.domain.users.api.dto.request;

public record UserSignInRequest(
        String email,
        String password,
        String refreshToken
) {
}
