package com.rushWash.domain.users.api;

import com.rushWash.common.response.ApiResponse;
import com.rushWash.domain.users.api.dto.request.UserSignInRequest;
import com.rushWash.domain.users.api.dto.request.UserSignupRequest;
import com.rushWash.domain.users.api.dto.response.UserSignInResponse;
import com.rushWash.domain.users.api.dto.response.UserSignupResponse;
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

}
