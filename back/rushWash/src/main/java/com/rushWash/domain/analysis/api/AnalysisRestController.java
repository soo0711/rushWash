package com.rushWash.domain.analysis.api;

import com.rushWash.common.response.ApiResponse;
import com.rushWash.common.response.CustomException;
import com.rushWash.common.response.ErrorCode;
import com.rushWash.domain.analysis.api.dto.response.AnalysisOnlyStainResponse;
import com.rushWash.domain.analysis.service.AnalysisService;
import com.rushWash.domain.users.service.TokenService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequiredArgsConstructor
@RequestMapping("/analysis")
public class AnalysisRestController {

    private final AnalysisService analysisService;
    private final TokenService tokenService;

    // fastAPI와 연결해야함
    @PostMapping("/stain")
    public ApiResponse<AnalysisOnlyStainResponse> getStainAnalysis(
            @RequestHeader(name = "Authorization", required = false) String authHeader,
            @RequestPart("file") MultipartFile file){

        if (authHeader == null || authHeader.isEmpty()){
            throw new CustomException(ErrorCode.INVALID_TOKEN);
        }

        int userId = tokenService.extractUserIdFromHeader(authHeader);
        AnalysisOnlyStainResponse response = analysisService.getStainAnalysis(userId, file);

        return ApiResponse.ok(response);
    }

    @PostMapping("/label")
    public ApiResponse<String> getLabelAnalysis(
            @RequestHeader(name = "Authorization", required = false) String authHeader,
            @RequestPart("file") MultipartFile file){

        if (authHeader == null || authHeader.isEmpty()){
            throw new CustomException(ErrorCode.INVALID_TOKEN);
        }

        int userId = tokenService.extractUserIdFromHeader(authHeader);
        analysisService.getLabelAnalysis(userId, file);

        return ApiResponse.ok("임시 데이터 응답");
    }

    @PostMapping("/stain-label")
    public ApiResponse<String> getStainAndLabelAnalysis(
            @RequestHeader(name = "Authorization", required = false) String authHeader,
            @RequestPart("file") MultipartFile file){

        if (authHeader == null || authHeader.isEmpty()){
            throw new CustomException(ErrorCode.INVALID_TOKEN);
        }

        int userId = tokenService.extractUserIdFromHeader(authHeader);
        analysisService.getStainAndLabelAnalysis(userId, file);

        return ApiResponse.ok("임시 데이터 응답");
    }

}
