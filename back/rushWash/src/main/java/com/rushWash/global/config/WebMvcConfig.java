package com.rushWash.global.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    private final String uploadPath;

    public WebMvcConfig(@Value("${file.upload-path}") String uploadPath) {
        this.uploadPath = uploadPath;
    }

    // 웹 이미지 path와 서버에 업로드 된 실제 이미지와 매핑 설정
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {

        registry
                .addResourceHandler("/images/**") // web path: http://localhost/images/aaaa_1234354/gg.png
                .addResourceLocations("file:///" + uploadPath + "/images/"); // 실제 이미지 파일 위치

    }
}
