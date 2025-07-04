package com.rushWash.common.util;

import com.fasterxml.jackson.databind.ObjectMapper;

import java.io.File;
import java.io.InputStream;
import java.util.List;
import java.util.Map;
import com.fasterxml.jackson.core.type.TypeReference;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class JsonManager {
    private final ObjectMapper mapper = new ObjectMapper(); // ✅ 이 줄 추가

    @Value("${stain.json-path}")
    private String jsonFilePath;

    public Map<String, List<String>> load() {
        try {
            return mapper.readValue(new File(jsonFilePath), new TypeReference<>() {});
        } catch (Exception e) {
            throw new RuntimeException("JSON 파일 읽기 실패", e);
        }
    }

    public void save(Map<String, List<String>> data) {
        try {
            mapper.writerWithDefaultPrettyPrinter().writeValue(new File(jsonFilePath), data);
        } catch (Exception e) {
            throw new RuntimeException("JSON 파일 저장 실패", e);
        }
    }
//    public Map<String, List<String>> load() {
//        try (InputStream is = getClass().getClassLoader().getResourceAsStream(FILE_NAME)) {
//            if (is == null) {
//                throw new IllegalArgumentException("리소스 파일을 찾을 수 없습니다: " + FILE_NAME);
//            }
//            ObjectMapper mapper = new ObjectMapper();
//            return mapper.readValue(is, new TypeReference<>() {});
//        } catch (Exception e) {
//            throw new RuntimeException("JSON 파일 읽기 실패", e);
//        }
//    }
//
//    public void save(Map<String, List<String>> data) {
//        try {
//            mapper.writerWithDefaultPrettyPrinter().writeValue(new File(FILE_NAME), data);
//        } catch (Exception e) {
//            throw new RuntimeException("JSON 파일 저장 실패", e);
//        }
//    }
}
