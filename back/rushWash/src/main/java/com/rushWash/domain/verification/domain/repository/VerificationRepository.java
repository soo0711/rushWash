package com.rushWash.domain.verification.domain.repository;

import com.rushWash.domain.users.domain.User;
import com.rushWash.domain.verification.domain.Verification;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VerificationRepository extends JpaRepository<Verification, Integer> {
    Verification findByEmailAndVerifyCode(String email, int verifyCode);

    void deleteById(int verifyId);

}
