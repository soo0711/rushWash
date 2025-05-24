package com.rushWash.domain.api.admin.users.api.dto.request;

public record AdminUserUpdateRequest(
        int userId,
        String name,
        String email,
        String phoneNumber
) {
}
