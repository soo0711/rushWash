package com.rushWash.domain.api.admin.stainRemoval.service;

import com.rushWash.common.response.CustomException;
import com.rushWash.common.response.ErrorCode;
import com.rushWash.common.util.JsonManager;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RequiredArgsConstructor
@Service
public class AdminStainRemovalService {

    private final JsonManager jsonManager; // 네가 만든 JSON 로딩 클래스

    public Map<String, List<String>> getStainRemovalList() {
        return jsonManager.load(); // Map<String, List<String>>로 리턴하도록 수정
    }

    public void addStainRemoval(String stain, String method) {
        Map<String, List<String>> data = jsonManager.load();

        // 이미 있으면 리스트에 추가, 없으면 새 리스트 생성
        data.computeIfAbsent(stain, k -> new ArrayList<>()).add(method);

        jsonManager.save(data);
    }

    public void updateStainRemoval(String stain, String method, String updatedMethod) {
        Map<String, List<String>> data = jsonManager.load();

        if (!data.containsKey(stain)) {
            throw new CustomException(ErrorCode.NOT_FOUND_STAIN);
        }

        List<String> methods = new ArrayList<>(data.get(stain));

        int index = methods.indexOf(method);
        if (index == -1) {
            throw new CustomException(ErrorCode.NOT_FOUND_METHOD);
        }

        methods.set(index, updatedMethod);
        data.put(stain, methods);

        jsonManager.save(data);
    }


    public void deleteStainRemoval(String stain, String method) {
        Map<String, List<String>> data = jsonManager.load();

        if (!data.containsKey(stain)) {
            throw new CustomException(ErrorCode.NOT_FOUND_STAIN);
        }

        List<String> methods = new ArrayList<>(data.get(stain));

        if (!methods.contains(method)) {
            throw new CustomException(ErrorCode.NOT_FOUND_METHOD);
        }

        methods.remove(method);

        if (methods.isEmpty()) {
            data.remove(stain);
        } else {
            data.put(stain, methods);
        }

        jsonManager.save(data);
    }

}
