package com.rushWash.domain.users.service;

import com.rushWash.common.EncryptUtils;
import com.rushWash.common.response.ApiResponse;
import com.rushWash.common.response.CustomException;
import com.rushWash.common.response.ErrorCode;
import com.rushWash.domain.users.api.dto.request.UserDuplicateCheckRequest;
import com.rushWash.domain.users.api.dto.request.UserSignInRequest;
import com.rushWash.domain.users.api.dto.request.UserSignupRequest;
import com.rushWash.domain.users.api.dto.response.UserSignInResponse;
import com.rushWash.domain.users.api.dto.response.UserSignupResponse;
import com.rushWash.domain.users.domain.User;
import com.rushWash.domain.users.domain.repository.UserRepository;
import com.rushWash.global.security.jwt.JwtUtil;
import com.rushWash.global.security.jwt.repository.TokenStore;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private final TokenStore tokenStore;

    public UserSignupResponse addUser(UserSignupRequest request){

        // 비밀번호 암호화
        String hashedPassword = EncryptUtils.sha256(request.password());

        User user = userRepository.save(
                User.builder()
                        .name(request.name())
                        .email(request.email())
                        .password(hashedPassword)
                        .phoneNumber(request.phoneNumber())
                        .build()
        );

        return new UserSignupResponse(true, "회원가입 성공", user.getId());
    }

    public ApiResponse<UserSignInResponse> userSignIn(UserSignInRequest request){
        String hashedPassword = EncryptUtils.sha256(request.password());
        User user = userRepository.findByEmailAndPassword(request.email(), hashedPassword);

        if (user == null){

            throw new CustomException(ErrorCode.USER_NOT_FOUND);
        }

        UserSignInResponse response = createTokens(user, request.refreshToken());

        return ApiResponse.ok(response);
    }

    public UserSignInResponse createTokens(User user, String refreshToken) {
        String accessToken;
        String newRefreshToken;

        if (refreshToken != null && jwtUtil.validateToken(refreshToken) &&
                tokenStore.isValidStoredToken(user.getId(), refreshToken)) {

            accessToken = jwtUtil.createAccessToken(user);
            newRefreshToken = refreshToken;

        } else {
            accessToken = jwtUtil.createAccessToken(user);
            newRefreshToken = jwtUtil.createRefreshToken(user);

            tokenStore.storeRefreshToken(user.getId(), newRefreshToken);
        }

        return new UserSignInResponse(accessToken, newRefreshToken, user);
    }

    public void signOut(String token) {
        int userId = jwtUtil.getUserIdFromToken(token);
        tokenStore.removeRefreshToken(userId);
    }

    public void isUserDuplicated(UserDuplicateCheckRequest request){
        // 이메일 중복 확인
        if (userRepository.existsByEmail(request.email())) {
            throw new CustomException(ErrorCode.DUPLICATE_EMAIL);
        }

        // 전화번호 중복 확인
        if (userRepository.existsByPhoneNumber(request.phoneNumber())) {
            throw new CustomException(ErrorCode.DUPLICATE_PHONE_NUMBER);
        }
    }
}
