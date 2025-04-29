package com.rushWash.domain.verification.service;

import com.rushWash.domain.verification.domain.Mail;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.util.Random;

@Service
public class MailService {

    @Autowired
    private  JavaMailSender javaMailSender;

    public int getVerifyCode() {
        Random rand = new Random();
        String strRand = "";
        for (int i = 0; i < 8; i++) {
            strRand += rand.nextInt(10);
        }

        int verifyCode = Integer.parseInt(strRand);
        return verifyCode;
    }

    public Mail createMail(String email, int verifyCode) {
        Mail mail = new Mail();
        mail.setAddress(email);
        mail.setTitle("[빨리빨래] 비밀번호 재설정 인증 코드 입니다.");
        mail.setMessage("안녕하세요. 빨리빨래 비밀번호 재설정 인증 코드 관련 이메일입니다.\n인증코드는 " + verifyCode + " 입니다.");

        return mail;
    }

    public void sendMail(Mail mail) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(mail.getAddress());
        message.setSubject(mail.getTitle());
        message.setText(mail.getMessage());
        message.setFrom("chaeykery@naver.com");
        message.setReplyTo("chaeykery@naver.com");
        System.out.println("message"+message);
        javaMailSender.send(message);
    }
}
