package com.rushWash.domain.users.service;

import com.rushWash.common.EncryptUtils;
import com.rushWash.common.response.ApiResponse;
import com.rushWash.common.response.CustomException;
import com.rushWash.common.response.ErrorCode;
import com.rushWash.domain.users.api.dto.request.*;
import com.rushWash.domain.users.api.dto.response.*;
import com.rushWash.domain.users.domain.User;
import com.rushWash.domain.users.domain.repository.UserRepository;
import com.rushWash.domain.verification.domain.Mail;
import com.rushWash.domain.verification.domain.Verification;
import com.rushWash.domain.verification.service.MailService;
import com.rushWash.domain.verification.service.VerificationService;
import com.rushWash.global.security.jwt.JwtUtil;
import com.rushWash.global.security.jwt.repository.TokenStore;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private final TokenStore tokenStore;

    private final VerificationService verificationService;

    private final MailService mailService;

    public UserSignupResponse addUser(UserSignupRequest request) {

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

    public ApiResponse<UserSignInResponse> userSignIn(UserSignInRequest request) {
        String hashedPassword = EncryptUtils.sha256(request.password());
        User user = userRepository.findByEmailAndPassword(request.email(), hashedPassword);

        if (user == null) {

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

    public void isUserDuplicated(UserDuplicateCheckRequest request) {
        // 이메일 중복 확인
        if (userRepository.existsByEmail(request.email())) {
            throw new CustomException(ErrorCode.DUPLICATE_EMAIL);
        }

        // 전화번호 중복 확인
        if (userRepository.existsByPhoneNumber(request.phoneNumber())) {
            throw new CustomException(ErrorCode.DUPLICATE_PHONE_NUMBER);
        }
    }

    public UserEmailFindResponse getEmailByPhoneNumber(UserEmailFindRequest request) {
        User user = userRepository.findByPhoneNumber(request.phoneNumber());

        if (user == null) {

            throw new CustomException(ErrorCode.USER_NOT_FOUND);
        }

        String email = user.getEmail();
        int atIndex = email.indexOf('@');
        String localPart = email.substring(0, atIndex);
        String domainPart = email.substring(atIndex);

        int visibleLength = localPart.length() / 2;
        String visiblePart = localPart.substring(0, visibleLength);
        String maskedPart = "*".repeat(localPart.length() - visibleLength);

        String maskedEmail = visiblePart + maskedPart + domainPart;

        return new UserEmailFindResponse(true, "아이디 찾기 성공", maskedEmail);
    }

    public UserSendVerificationCodeResponse getUserByNameAndEmail(UserSendVerificationCodeRequest request) {
        User user = userRepository.findByNameAndEmail(request.name(), request.email());
        if (user == null) {
            throw new CustomException(ErrorCode.USER_NOT_FOUND);
        }
        //메일 전송
        int verifyCode = mailService.getVerifyCode();
        Mail mail = mailService.createMail(user.getEmail(), verifyCode);
        try {
            mailService.sendMail(mail);
        } catch (Exception e) {
            throw new CustomException(ErrorCode.MAIL_SEND_FAILED); // 메일 전송 실패 시 예외 처리
        }

        //인증 번호 DB저장
        verificationService.addVerification(user.getId(),request.email(), verifyCode);

        return new UserSendVerificationCodeResponse(true, "인증 번호 전송 완료", verifyCode);

    }
    public UserVerifyCodeResponse verifyCode(UserVerifyCodeRequest request) {
        Verification verification = verificationService.getVerificationByEmailAndVerifyCode(request.email(), request.verifyCode());
        if (verification == null) {
            throw new CustomException(ErrorCode.INVALID_VERIFICATION_CODE);
        }

        //인증 성공시 DB삭제
        verificationService.deleteVerification(verification.getId());
        return new UserVerifyCodeResponse(true, "인증 성공", verification.getUserId());

    }

    public UserPasswordResponse resetPassword(UserPasswordRequest request) {
        User user = userRepository.findById(request.userId())
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        String hashedPassword = EncryptUtils.sha256(request.password());
        user = user.toBuilder() // 기존 내용은 그대로
                .password(hashedPassword)
                .build();
        userRepository.save(user); // 데이터 있으면 수정

        return new UserPasswordResponse(true, "비밀번호 변경 성공", user.getId());
    }

    public List<User> getUserList(){
        return userRepository.findAll();
    }

    @Transactional
    public void updateUser(int userId, String name, String email, String phoneNumber){
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));
        user.updateInfo(name, email, phoneNumber);
    }

    public void deleteUser(int userId){
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        userRepository.deleteById(userId);
    }
}
