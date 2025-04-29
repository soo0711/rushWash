package com.rushWash.domain.users.api;

import com.rushWash.common.response.ApiResponse;
import com.rushWash.domain.users.api.dto.request.*;
import com.rushWash.domain.users.api.dto.response.*;
import com.rushWash.domain.users.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/users")
public class UserRestController {

    private final UserService userService;
    @PostMapping("/signup")
    public ApiResponse<UserSignupResponse> userSignup(
            @RequestBody UserSignupRequest request){

        UserSignupResponse response = userService.addUser(request);

        return ApiResponse.ok(response);
    }

    @PostMapping("/sign-in")
    public ApiResponse<UserSignInResponse> userSignIn(
            @RequestBody UserSignInRequest request){

        return userService.userSignIn(request);
    }

    @PostMapping("/sign-out")
    public ApiResponse<String> userSignOut(
            @RequestHeader("Authorization") String authHeader) {

        String accessToken = authHeader.substring(7);
        userService.signOut(accessToken);

        return ApiResponse.ok("로그아웃 성공");
    }

    @PostMapping("/duplicate-check")
    public ApiResponse<String> checkUserDuplication(
            @RequestBody UserDuplicateCheckRequest request){

        userService.isUserDuplicated(request);

        return ApiResponse.ok("사용 가능 합니다.");
    }

    @GetMapping("/email-find")
    public ApiResponse<UserEmailFindResponse> userEmailFind(
            @RequestBody UserEmailFindRequest request){

        UserEmailFindResponse response = userService.getEmailByPhoneNumber(request);

        return ApiResponse.ok(response);
    }

    @PostMapping("/send-verification-code")
    public ApiResponse<UserSendVerificationCodeResponse> userSendVerificationCode(
            @RequestBody UserSendVerificationCodeRequest request){
        UserSendVerificationCodeResponse response = userService.getUserByNameAndEmail(request);

        return ApiResponse.ok(response);
    }


    @GetMapping("/verify-code")
    public ApiResponse<UserVerifyCodeResponse> userVerifyCode(
            @RequestBody UserVerifyCodeRequest request){
        //인증번호 인증 성공
        UserVerifyCodeResponse response = userService.verifyCode(request);

        return ApiResponse.ok(response);
    }

    @PatchMapping("/password")
    public UserPasswordResponse userPassword(
            @RequestBody UserPasswordRequest request){

        UserPasswordResponse response = userService.resetPassword(request);

        return response;
    }

}
