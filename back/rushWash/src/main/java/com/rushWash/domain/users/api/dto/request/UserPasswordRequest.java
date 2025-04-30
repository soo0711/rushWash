package com.rushWash.domain.users.api.dto.request;

public record UserPasswordRequest(
        int userId,
        String password
) {
}
