package com.rushWash.domain.users.api.dto.response;

import com.rushWash.domain.users.domain.User;
public record UserEmailFindResponse(
        boolean success,
        String message,
        String email
) {
}
