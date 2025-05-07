package com.rushWash.domain.admin.users.service;

import com.rushWash.domain.admin.users.api.dto.request.AdminUserUpdateRequest;
import com.rushWash.domain.users.domain.User;
import com.rushWash.domain.users.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminUsersService {

    private final UserService userService;

    public List<User> getUserLit(){
        return userService.getUserList();
    }

    public void updateUser(int userId, String name, String email, String phoneNumber){
        userService.updateUser(userId, name, email, phoneNumber);
    }

    public void deleteUser(int userId){
        userService.deleteUser(userId);
    }
}
