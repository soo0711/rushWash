package com.rushWash.domain.admin.users.api;

import com.rushWash.common.response.ApiResponse;
import com.rushWash.domain.admin.users.api.dto.request.AdminUserDeleteRequest;
import com.rushWash.domain.admin.users.api.dto.request.AdminUserUpdateRequest;
import com.rushWash.domain.admin.users.service.AdminUsersService;
import com.rushWash.domain.users.domain.User;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/admin/users")
public class AdminUsersRestController {

    private final AdminUsersService adminUsersService;

    @GetMapping
    public ApiResponse<List<User>> getUserList(){

        return ApiResponse.ok(adminUsersService.getUserList());
    }

    @PatchMapping
    public ApiResponse<String> updateUser(
            @RequestBody AdminUserUpdateRequest request){

        adminUsersService.updateUser(request.userId(), request.name(), request.email(), request.phoneNumber());

        return ApiResponse.ok("사용자 업데이트 완료");
    }

    @DeleteMapping
    public ApiResponse<String> deleteUser(
            @RequestBody AdminUserDeleteRequest request){

        adminUsersService.deleteUser(request.userId());

        return ApiResponse.ok("사용자 삭제 완료");
    }
}
