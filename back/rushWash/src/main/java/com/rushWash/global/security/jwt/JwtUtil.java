package com.rushWash.global.security.jwt;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.rushWash.common.response.CustomException;
import com.rushWash.common.response.ErrorCode;
import com.rushWash.domain.users.domain.User;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Base64;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class JwtUtil {

    @Value("${jwt.secret}")
    private String secretKey;

    private final String ALGORITHM = "HmacSHA256";
    private final long ACCESS_TOKEN_VALIDITY = 30 * 60 * 1000; // 30분
    private final long REFRESH_TOKEN_VALIDITY = 7 * 24 * 60 * 60 * 1000; // 7일
    private static final Logger log = LoggerFactory.getLogger(JwtUtil.class);
    private final ObjectMapper objectMapper;

    // accessToken 생성
    public String createAccessToken(int userId, String email) {
        Date now = new Date();
        Date expiration = new Date(now.getTime() + ACCESS_TOKEN_VALIDITY);

        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", userId);
        claims.put("email", email);

        return createToken(claims, now, expiration);
    }

    // refreshToken
    public String createRefreshToken(int userId, String email) {
        Date now = new Date();
        Date expiration = new Date(now.getTime() + REFRESH_TOKEN_VALIDITY);

        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", userId);
        claims.put("email", email);

        return createToken(claims, now, expiration);
    }

    // 헤더 생성
    private String createHeader() {
        Map<String, Object> header = new HashMap<>();
        header.put("alg", "HS256");
        header.put("typ", "JWT");
        return mapToJson(header);
    }

    // JWT 토큰 생성
    private String createToken(Map<String, Object> claims, Date issuedAt, Date expiration) {
        String headerJson = createHeader();
        claims.put("iat", issuedAt.getTime() / 1000);
        claims.put("exp", expiration.getTime() / 1000);
        String payloadJson = mapToJson(claims);

        String encodedHeader = base64UrlEncode(headerJson);
        String encodedPayload = base64UrlEncode(payloadJson);
        String content = encodedHeader + "." + encodedPayload;

        return content + "." + generateSignature(content);
    }

    // 토큰 유효성 검증
    public boolean validateToken(String token) {
        try {
            String[] parts = token.split("\\.");
            if (parts.length != 3)
                throw new CustomException(ErrorCode.TOKEN_PARSING_FAILED);

            String content = parts[0] + "." + parts[1];
            String signature = generateSignature(content);

            if (!MessageDigest.isEqual(signature.getBytes(), parts[2].getBytes()))
                throw new CustomException(ErrorCode.INVALID_TOKEN);

            String payload = decodeBase64(parts[1]);
            Map<String, Object> claims = objectMapper.readValue(payload, new TypeReference<>() {});
            long exp = ((Number) claims.get("exp")).longValue();

            if (exp <= (new Date().getTime() / 1000))
                throw new CustomException(ErrorCode.EXPIRED_TOKEN);

            return true;
        } catch (CustomException e) {
            log.error("JWT 유효성 검사 실패: {}", e.getErrorCode().getMessage());
        } catch (Exception e) {
            log.error("JWT 유효성 검사 중 예외 발생", e);
        }
        return false;
    }

    // 토큰에서 UserId 추출
    public int getUserIdFromToken(String token) {
        try {
            Map<String, Object> claims = getClaims(token);
            return ((Number) claims.get("userId")).intValue();
        } catch (Exception e) {
            e.printStackTrace();
            throw new CustomException(ErrorCode.TOKEN_USERID_EXTRACTION_FAILED);
        }
    }

    // 토큰에서 email 추출
    public String getEmailFromToken(String token) {
        try {
            Map<String, Object> claims = getClaims(token);
            return (String) claims.get("email");
        } catch (Exception e) {
            e.printStackTrace();
            throw new CustomException(ErrorCode.TOKEN_EMAIL_EXTRACTION_FAILED);
        }
    }

    // 토큰에서 Claims 추출
    private Map<String, Object> getClaims(String token) {
        try {
            String[] parts = token.split("\\.");
            String payload = decodeBase64(parts[1]);
            return objectMapper.readValue(payload, new TypeReference<>() {
            });
        } catch (Exception e) {
            throw new CustomException(ErrorCode.TOKEN_PARSING_FAILED);
        }
    }

    // Base64 디코딩
    private String decodeBase64(String encoded) {
        return new String(Base64.getUrlDecoder().decode(encoded), StandardCharsets.UTF_8);
    }

    // JSON 생성
    private String mapToJson(Map<String, Object> map) {
        try {
            return objectMapper.writeValueAsString(map);
        } catch (Exception e) {
            throw new CustomException(ErrorCode.JSON_CONVERT_FAILED);
        }
    }

    // Base64Url 인코딩
    private String base64UrlEncode(String value) {
        return Base64.getUrlEncoder().withoutPadding()
                .encodeToString(value.getBytes(StandardCharsets.UTF_8));
    }

    // HMAC-SHA256 서명 생성
    private String generateSignature(String content) {
        try {
            Mac mac = Mac.getInstance(ALGORITHM);
            SecretKeySpec secretKeySpec = new SecretKeySpec(
                    secretKey.getBytes(StandardCharsets.UTF_8), ALGORITHM);
            mac.init(secretKeySpec);
            byte[] hash = mac.doFinal(content.getBytes(StandardCharsets.UTF_8));
            return Base64.getUrlEncoder().withoutPadding().encodeToString(hash);
        } catch (Exception e) {
            e.printStackTrace();
            throw new CustomException(ErrorCode.SIGNATURE_GENERATION_FAILED);
        }
    }

    // Users 객체로 accessToken 생성
    public String createAccessToken(User user) {
        return createAccessToken(user.getId(), user.getEmail());
    }

    // Users 객체로 refreshToken 생성
    public String createRefreshToken(User user) {
        return createRefreshToken(user.getId(), user.getEmail());
    }
}
