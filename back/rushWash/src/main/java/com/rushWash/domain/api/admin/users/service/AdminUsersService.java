package com.rushWash.domain.api.admin.users.service;

import com.rushWash.common.response.CustomException;
import com.rushWash.common.response.ErrorCode;
import com.rushWash.domain.users.domain.User;
import com.rushWash.domain.users.domain.repository.UserRepository;
import com.rushWash.domain.users.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminUsersService {

    private final UserService userService;

    private final UserRepository userRepository;

    public List<User> getUserList(){
        return userService.getUserList();
    }

    public void updateUser(int userId, String name, String email, String phoneNumber){
        userService.updateUser(userId, name, email, phoneNumber);
    }

    public void deleteUser(int userId){
        userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        userRepository.deleteById(userId);
    }
}
