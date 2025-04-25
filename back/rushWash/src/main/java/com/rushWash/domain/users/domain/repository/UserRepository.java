package com.rushWash.domain.users.domain.repository;

import com.rushWash.domain.users.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

public interface UserRepository extends JpaRepository<User, Integer> {
    boolean existsByPhoneNumber(String phoneNumber);

    boolean existsByEmail(String email);
    User findByEmailAndPassword(String email, String password);
}
