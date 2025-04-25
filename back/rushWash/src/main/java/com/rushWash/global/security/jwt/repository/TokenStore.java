package com.rushWash.global.security.jwt.repository;

import org.springframework.stereotype.Component;

import java.util.concurrent.ConcurrentHashMap;

@Component
public class TokenStore {

    private final ConcurrentHashMap<Integer, String> refreshTokenStore = new ConcurrentHashMap<>();

    // 저장
    public void storeRefreshToken(int userId, String refreshToken) {
        refreshTokenStore.put(userId, refreshToken);
    }

    // 조회
    public String getRefreshToken(int userId) {
        return refreshTokenStore.get(userId);
    }

    // 삭제
    public void removeRefreshToken(int userId) {
        refreshTokenStore.remove(userId);
    }

    // 유효성 검사 (옵션)
    public boolean isValidStoredToken(int userId, String token) {
        return token.equals(refreshTokenStore.get(userId));
    }
}

