package com.rushWash.domain.users.api.dto.response;

public record UserPasswordResponse(
        boolean success,
        String message,
        int userId
) {
}
