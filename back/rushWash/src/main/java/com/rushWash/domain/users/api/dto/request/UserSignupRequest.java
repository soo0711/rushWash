package com.rushWash.domain.users.api.dto.request;

public record UserSignupRequest(
        String name,
        String phoneNumber,
        String password,
        String email
) {
}
