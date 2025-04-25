package com.rushWash.common;

import com.rushWash.common.response.CustomException;
import com.rushWash.common.response.ErrorCode;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

public class EncryptUtils {
    public static String bytesToHex(byte[] bytes) {
        StringBuilder builder = new StringBuilder();
        for (byte b : bytes) {
            builder.append(String.format("%02x", b));
        }
        return builder.toString();
    }

    public static String sha256(String msg) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            md.update(msg.getBytes());

            return bytesToHex(md.digest());
        } catch (NoSuchAlgorithmException e) {
            e.printStackTrace();

            throw new CustomException(ErrorCode.NO_SUCH_ALGORITHM);
        }
    }
}
