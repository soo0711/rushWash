package com.rushWash.domain.users.service;

import com.rushWash.common.response.CustomException;
import com.rushWash.common.response.ErrorCode;
import com.rushWash.global.security.jwt.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class TokenService {
    private final JwtUtil jwtUtil;

    public int extractUserIdFromHeader(String authHeader) {
        String token = parseToken(authHeader);

        if (!jwtUtil.validateToken(token)) {

            throw new CustomException(ErrorCode.INVALID_TOKEN);
        }

        return jwtUtil.getUserIdFromToken(token);
    }

    private String parseToken(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {

            throw new CustomException(ErrorCode.INVALID_TOKEN);
        }
        return authHeader.replace("Bearer ", "");
    }

}
