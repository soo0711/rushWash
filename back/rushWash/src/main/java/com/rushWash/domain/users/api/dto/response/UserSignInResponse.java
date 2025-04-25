package com.rushWash.domain.users.api.dto.response;

import com.rushWash.domain.users.domain.User;

public record UserSignInResponse(
        String refreshToken,
        String accessToken,
        User user
) {
}
