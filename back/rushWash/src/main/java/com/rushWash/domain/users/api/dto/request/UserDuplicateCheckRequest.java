package com.rushWash.domain.users.api.dto.request;

public record UserDuplicateCheckRequest(
        String email,
        String phoneNumber
) {
}
