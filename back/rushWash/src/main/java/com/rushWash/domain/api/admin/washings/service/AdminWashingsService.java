package com.rushWash.domain.api.admin.washings.service;

import com.rushWash.common.file.FileManagerService;
import com.rushWash.common.response.CustomException;
import com.rushWash.common.response.ErrorCode;
import com.rushWash.domain.api.admin.washings.api.dto.response.WashingListResponse;
import com.rushWash.domain.washings.domain.WashingHistory;
import com.rushWash.domain.washings.domain.repository.WashingHistoryRepository;
import com.rushWash.domain.washings.service.WashingService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminWashingsService {
    private final WashingService washingService;
    private final FileManagerService fileManagerService;
    private final WashingHistoryRepository washingHistoryRepository;

    @Value("${python.script-path}")
    private String pythonScriptPath;

    public List<WashingListResponse> getWashingList() {
        return washingService.getAdminWashingList();
    }

    public List<WashingListResponse> getWashingGoodList() {
        return washingService.getAdminWashingGoodList();
    }
    public void deleteWashing(int washingHistoryId) {
        WashingHistory washingHistory = washingHistoryRepository.findById(washingHistoryId)
                .orElseThrow(() -> new CustomException(ErrorCode.WASHING_HISTORY_NOT_FOUNT));
        if(washingHistory.getLabelImageUrl() != null) {
            fileManagerService.deleteFile(washingHistory.getLabelImageUrl());
        }

        if(washingHistory.getStainImageUrl() != null) {
            fileManagerService.deleteFile(washingHistory.getStainImageUrl());
        }
        washingHistoryRepository.deleteById(washingHistoryId);
    }

    public void reLearningAI() {
        int labelCount = washingHistoryRepository.getLabelGoodCount();
        int stainCount = washingHistoryRepository.getStainGoodCount();
        if (labelCount < 10 || stainCount < 10) {
            throw new CustomException(ErrorCode.INSUFFICIENT_DATA_FOR_RELEARNING);
        }

        try {
            runPythonScript();
        } catch (IOException | InterruptedException e) {
            throw new CustomException(ErrorCode.PYTHON_SCRIPT_EXECUTION_FAILED);
        }
    }


    private void runPythonScript() throws IOException, InterruptedException {
        // 파이썬 실행 경로와 스크립트 위치 지정 (절대 경로 권장)
        String pythonExe = "python"; // python3일 수도 있음 (OS 환경에 따라 다름)
        String scriptPath = pythonScriptPath + "/pipe_final.py";

        ProcessBuilder processBuilder = new ProcessBuilder(pythonExe, scriptPath);
        // 에러 스트림도 같이 출력에 포함
        processBuilder.redirectErrorStream(true);
        Process process = processBuilder.start();

        // 출력 읽기
        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(process.getInputStream()))) {

            String line;
            while ((line = reader.readLine()) != null) {
                System.out.println("[Python] " + line);
            }
        }

        int exitCode = process.waitFor(); // 여기서 예외 던짐
        System.out.println("Python 프로세스 종료 코드: " + exitCode);

        if (exitCode != 0) {
            throw new CustomException(ErrorCode.PYTHON_SCRIPT_EXECUTION_FAILED);
        }

    }
}
