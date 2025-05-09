package com.rushWash.domain.washings.api;

import com.rushWash.common.response.ApiResponse;
import com.rushWash.common.response.CustomException;
import com.rushWash.common.response.ErrorCode;
import com.rushWash.domain.users.service.TokenService;
import com.rushWash.domain.washings.api.dto.request.WashingEstimationRequest;
import com.rushWash.domain.washings.api.dto.response.WashingDetailResponse;
import com.rushWash.domain.washings.api.dto.response.WashingList;
import com.rushWash.domain.washings.service.WashingService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/washings")
public class WashingRestController {

    private final WashingService washingService;
    private final TokenService tokenService;

    @GetMapping
    public ApiResponse<List<WashingList>> getWashingList(
            @RequestHeader(name = "Authorization", required = false) String authHeader) {

        if (authHeader == null || authHeader.isEmpty()){
            throw new CustomException(ErrorCode.INVALID_TOKEN);
        }

        int userId = tokenService.extractUserIdFromHeader(authHeader);

        return ApiResponse.ok(washingService.getWashingListByUserId(userId));
    }

    @GetMapping("/{washingHistoryId}")
    public ApiResponse<WashingDetailResponse> getWashingDetail(
            @RequestHeader(name = "Authorization", required = false) String authHeader,
            @PathVariable int washingHistoryId) {

        if (authHeader == null || authHeader.isEmpty()){
            throw new CustomException(ErrorCode.INVALID_TOKEN);
        }

        int userId = tokenService.extractUserIdFromHeader(authHeader);
        WashingDetailResponse response = washingService.getWashingDetailByUserIdAndWashingHistoryId(userId, washingHistoryId);
        return ApiResponse.ok(response);
    }

    @PatchMapping("/{washingHistoryId}")
    public ApiResponse<String> washingEstimation(
            @PathVariable int washingHistoryId,
            @RequestBody WashingEstimationRequest request,
            @RequestHeader(name = "Authorization", required = false) String authHeader) {

        if (authHeader == null || authHeader.isEmpty()){
            throw new CustomException(ErrorCode.INVALID_TOKEN);
        }

        int userId = tokenService.extractUserIdFromHeader(authHeader);
        washingService.updateWashingHistory(userId, washingHistoryId, request);

        return ApiResponse.ok("분석 내역 평가 완료했습니다.");
    }
}
