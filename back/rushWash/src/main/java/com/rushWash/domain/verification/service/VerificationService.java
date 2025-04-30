package com.rushWash.domain.verification.service;

import com.rushWash.domain.verification.domain.Verification;
import com.rushWash.domain.verification.domain.repository.VerificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class VerificationService {

    private final VerificationRepository verificationRepository;

    public void addVerification(int userId, String email, int verifyCode){

        Verification verification = verificationRepository.save(
                Verification.builder()
                        .userId(userId)
                        .email(email)
                        .verifyCode(verifyCode)
                        .build()
        );
    }

    public Verification getVerificationByEmailAndVerifyCode(String email, int verifyCode){
        Verification verification = verificationRepository.findByEmailAndVerifyCode(email, verifyCode);

        return verification;
    }

    public void deleteVerification(int verifyId){
        verificationRepository.deleteById(verifyId);
    }

}
