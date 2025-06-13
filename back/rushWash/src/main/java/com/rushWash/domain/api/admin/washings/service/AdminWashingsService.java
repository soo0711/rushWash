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
import org.springframework.transaction.annotation.Transactional;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
@RequiredArgsConstructor
public class AdminWashingsService {
    private final WashingService washingService;
    private final FileManagerService fileManagerService;
    private final WashingHistoryRepository washingHistoryRepository;
    private static final Logger log = LoggerFactory.getLogger(AdminWashingsService.class);

    @Value("${python.script-path}")
    private String pythonScriptPath;

    @Value("${spring.datasource.host}")
    private String dbHost;

    @Value("${spring.datasource.port}")
    private String dbPort;

    @Value("${spring.datasource.name}")
    private String dbName;

    @Value("${spring.datasource.username}")
    private String dbUser;

    @Value("${spring.datasource.password}")
    private String dbPassword;


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

        executePythonScript();
    }

    @Transactional
    private String executePythonScript() {
        try {
            ProcessBuilder processBuilder = new ProcessBuilder(
                    "python",
                    pythonScriptPath + "/pipe_final.py",
                    "--db-host", dbHost,
                    "--db-port", dbPort,
                    "--db-user", dbUser,
                    "--db-password", dbPassword,
                    "--db-name", dbName
            );

            processBuilder.redirectErrorStream(true);
            Process process = processBuilder.start();

            StringBuilder output = new StringBuilder();
            try (BufferedReader reader = new BufferedReader(
                    new InputStreamReader(process.getInputStream(), StandardCharsets.UTF_8))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    output.append(line).append("\n");
                }
            }


            int exitCode = process.waitFor();
            if (exitCode != 0) {
                log.error("Python 오류 로그:\n{}", output.toString());  // 여기에 추가
                throw new CustomException(ErrorCode.PYTHON_SCRIPT_EXECUTION_FAILED);
            }
            log.error("Python 실행 결과 (stdout/stderr):\n{}", output.toString());

            return output.toString();
        } catch (IOException | InterruptedException e) {
            throw new CustomException(ErrorCode.PYTHON_SCRIPT_EXECUTION_FAILED);
        }
    }

}
