package com.rushWash.domain.users.api.dto.response;

public record UserSignupResponse(
        boolean success,
        String message,
        int id
) {
}
