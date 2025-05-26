package com.rushWash.domain.analysis.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.rushWash.common.file.FileManagerService;
import com.rushWash.common.file.dto.response.SaveFileResult;
import com.rushWash.common.response.CustomException;
import com.rushWash.common.response.ErrorCode;
import com.rushWash.domain.analysis.api.dto.response.AnalysisOnlyLabelResponse;
import com.rushWash.domain.analysis.api.dto.response.AnalysisOnlyStainResponse;
import com.rushWash.domain.analysis.api.dto.response.AnalysisStainAndLabelResponse;
import com.rushWash.domain.washings.domain.AnalysisType;
import com.rushWash.domain.washings.domain.WashingHistory;
import com.rushWash.domain.washings.service.WashingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AnalysisService {

    private final WashingService washingService;
    private final FileManagerService fileManagerService;
    private final ObjectMapper objectMapper;
    @Value("${file.upload-path}")
    private String uploadPath;
    @Value("${python.script-path}")
    private String pythonScriptPath;

    private static final Logger log = LoggerFactory.getLogger(AnalysisService.class);

    @Transactional
    public AnalysisOnlyStainResponse getStainAnalysis(int userId, MultipartFile file){

        // 1. 파일 저장
        SaveFileResult result = saveFileAndGetPaths(userId, file);
        String savedFilePath = result.savedFilePath();
        String absoluteImagePath = result.absoluteFilePath();

        // 2. 파이썬 불러오기
        String pythonOutput = executePythonScript("stain_only", absoluteImagePath);

        // 3. JSON 응답값
        try {
            // JSON 문자열의 시작 위치 찾기 ('{' 문자가 나오는 위치)
            int jsonStart = pythonOutput.indexOf('{');
            if (jsonStart == -1) {
                throw new CustomException(ErrorCode.PYTHON_SCRIPT_OUTPUT_INVALID);
            }

            // JSON 부분만 추출
            String jsonOutput = pythonOutput.substring(jsonStart);

            AnalysisOnlyStainResponse response = objectMapper.readValue(jsonOutput, AnalysisOnlyStainResponse.class);

            if (response.detectedStain() == null
                    || response.detectedStain().top3() == null
                    || response.detectedStain().top3().isEmpty()){
                // 파일 지우기
                fileManagerService.deleteFile(savedFilePath);
                // 에러
                throw new CustomException(ErrorCode.STAIN_IMAGE_REUPLOAD);
            }

            // WashingHistory와 WashingResult 저장
            WashingHistory washingHistory = washingService.addWashingHistoryByStainImage(userId, AnalysisType.STAIN, savedFilePath);
            List<AnalysisOnlyStainResponse.WashingInstruction> instructions = response.washingInstructions();

            if (instructions == null) instructions = Collections.emptyList();

            for (var instruction : instructions) {
                List<String> detailInstructions = instruction.instructions();
                if (detailInstructions == null) detailInstructions = Collections.emptyList();

                for (String detail : detailInstructions) {
                    washingService.addWashingResult(
                            washingHistory,
                            instruction.clazz(),
                            detail
                    );
                }
            }

            // JSON을 DTO로 변환
            return response;
        } catch (IOException e) {
            throw new CustomException(ErrorCode.JSON_PARSING_FAILED);
        }
    }

    @Transactional
    public AnalysisOnlyLabelResponse getLabelAnalysis(int userId, MultipartFile file){
        // 1. 파일 저장
        SaveFileResult result = saveFileAndGetPaths(userId, file);
        String savedFilePath = result.savedFilePath();
        String absoluteImagePath = result.absoluteFilePath();

        // 2. 파이썬 불러오기
        String pythonOutput = executePythonScript("label_only", absoluteImagePath);

        // 3. JSON 응답값
        try {
            int jsonStart = pythonOutput.indexOf('{');
            if (jsonStart == -1) {
                throw new CustomException(ErrorCode.PYTHON_SCRIPT_OUTPUT_INVALID);
            }
            String jsonOutput = pythonOutput.substring(jsonStart);

            AnalysisOnlyLabelResponse response = objectMapper.readValue(jsonOutput, AnalysisOnlyLabelResponse.class);

            if (response.detectedLabels() == null || response.detectedLabels().isEmpty()) {
                fileManagerService.deleteFile(savedFilePath);
                throw new CustomException(ErrorCode.LABEL_IMAGE_REUPLOAD);
            }

            if (response.labelExplanation() == null || response.labelExplanation().isEmpty()) {
                fileManagerService.deleteFile(savedFilePath);
                throw new CustomException(ErrorCode.LABEL_IMAGE_REUPLOAD);
            }

            // WashingHistory와 WashingResult 저장
            WashingHistory washingHistory = washingService.addWashingHistoryByLabelImage(userId, AnalysisType.LABEL, savedFilePath);

            List<String> detectedLabels = response.detectedLabels();
            List<String> labelExplanation = response.labelExplanation();

            for (int i = 0; i < detectedLabels.size(); i++) {
                String category = detectedLabels.get(i);
                String explanation = labelExplanation.get(i);
                washingService.addWashingResult(washingHistory, category, explanation);
            }


            return response;
        } catch (IOException e) {
            throw new CustomException(ErrorCode.JSON_PARSING_FAILED);
        }
    }

    @Transactional
    public AnalysisStainAndLabelResponse getStainAndLabelAnalysis(int userId, MultipartFile stainFile, MultipartFile labelFile){
        // 1. 파일 저장
        SaveFileResult resultListStain = saveFileAndGetPaths(userId, stainFile);
        SaveFileResult resultListLabel = saveFileAndGetPaths(userId, labelFile);

        String savedFilePathStain = resultListStain.savedFilePath();
        String absoluteImagePathStain = resultListStain.absoluteFilePath();

        String savedFilePathLabel = resultListLabel.savedFilePath();
        String absoluteImagePathLabel = resultListLabel.absoluteFilePath();


        // 2. 파이썬 불러오기
        String pythonOutput = executePythonScriptByStainLabel("stain_and_label", absoluteImagePathStain, absoluteImagePathLabel);

        // 3. JSON 값 응답
        try {
            int jsonStart = pythonOutput.indexOf('{');
            if (jsonStart == -1) {
                throw new CustomException(ErrorCode.PYTHON_SCRIPT_OUTPUT_INVALID);
            }
            String jsonOutput = pythonOutput.substring(jsonStart);

            AnalysisStainAndLabelResponse response = objectMapper.readValue(jsonOutput, AnalysisStainAndLabelResponse.class);

            if (response.detectedLabels() == null || response.detectedLabels().isEmpty()) {
                fileManagerService.deleteFile(savedFilePathStain);
                fileManagerService.deleteFile(savedFilePathLabel);
                throw new CustomException(ErrorCode.STAIN_LABEL_IMAGE_REUPLOAD);
            }

            if (response.labelExplanation() == null || response.labelExplanation().isEmpty()) {
                fileManagerService.deleteFile(savedFilePathStain);
                fileManagerService.deleteFile(savedFilePathLabel);
                throw new CustomException(ErrorCode.STAIN_LABEL_IMAGE_REUPLOAD);
            }

            // WashingHistory와 WashingResult 저장
            WashingHistory washingHistory = washingService.addWashingHistoryByStainAndLabelImage(userId, AnalysisType.LABEL_AND_STAIN,
                    savedFilePathStain, savedFilePathLabel);

            washingService.addWashingResult(washingHistory, response.top1Stain(), response.washingInstruction());

            List<String> detectedLabels = response.detectedLabels();
            List<String> labelExplanation = response.labelExplanation();

            for (int i = 0; i < detectedLabels.size(); i++) {
                String category = detectedLabels.get(i);
                String explanation = labelExplanation.get(i);
                washingService.addWashingResult(washingHistory, category, explanation);
            }


            return response;
        } catch (IOException e) {
            throw new CustomException(ErrorCode.JSON_PARSING_FAILED);
        }
    }

    private String executePythonScript(String analysisType, String imagePath) {
        try {
            // 명령어 구성
            ProcessBuilder processBuilder = new ProcessBuilder(
                    "python",
                    pythonScriptPath + "/main.py",
                    analysisType,
                    imagePath
            );

            // 표준 오류를 표준 출력으로 리다이렉션
            processBuilder.redirectErrorStream(true);

            // 프로세스 시작
            Process process = processBuilder.start();

            // 출력 읽기
            StringBuilder output = new StringBuilder();
            try (BufferedReader reader = new BufferedReader(
                    new InputStreamReader(process.getInputStream(), StandardCharsets.UTF_8))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    output.append(line).append("\n");
                }
            }

            // 프로세스 종료 대기
            int exitCode = process.waitFor();

            if (exitCode != 0) {
                throw new CustomException(ErrorCode.PYTHON_SCRIPT_EXECUTION_FAILED);
            }

            return output.toString();
        } catch (IOException | InterruptedException e) {
            throw new CustomException(ErrorCode.PYTHON_SCRIPT_EXECUTION_FAILED);
        }
    }

    private String executePythonScriptByStainLabel(String analysisType, String stainImagePath, String labelImagePath) {
        try {
            // 명령어 구성
            ProcessBuilder processBuilder = new ProcessBuilder(
                    "python",
                    pythonScriptPath + "/main.py",
                    analysisType,
                    stainImagePath,
                    labelImagePath
            );

            // 표준 오류를 표준 출력으로 리다이렉션
            processBuilder.redirectErrorStream(true);

            // 프로세스 시작
            Process process = processBuilder.start();

            // 출력 읽기
            StringBuilder output = new StringBuilder();
            try (BufferedReader reader = new BufferedReader(
                    new InputStreamReader(process.getInputStream(), StandardCharsets.UTF_8))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    output.append(line).append("\n");
                }
            }

            // 프로세스 종료 대기
            int exitCode = process.waitFor();

            if (exitCode != 0) {
                throw new CustomException(ErrorCode.PYTHON_SCRIPT_EXECUTION_FAILED);
            }

            return output.toString();
        } catch (IOException | InterruptedException e) {
            throw new CustomException(ErrorCode.PYTHON_SCRIPT_EXECUTION_FAILED);
        }
    }

    private SaveFileResult saveFileAndGetPaths(int userId, MultipartFile file) {
        // 1. 로컬에 저장
        String savedFilePath = fileManagerService.saveFile(userId, file);
        if (savedFilePath == null) {
            throw new CustomException(ErrorCode.FILE_SAVE_FAILED);
        }
        // 2. 실제 저장된 파일의 절대 경로
        String absoluteFilePath = uploadPath + savedFilePath;
        return new SaveFileResult(savedFilePath, absoluteFilePath);
    }
}
