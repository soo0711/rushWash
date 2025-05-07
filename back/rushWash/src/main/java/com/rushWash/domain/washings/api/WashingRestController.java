package com.rushWash.domain.washings.api;

import com.rushWash.common.response.ApiResponse;
import com.rushWash.domain.users.service.TokenService;
import com.rushWash.domain.washings.api.dto.response.WashingDetailResponse;
import com.rushWash.domain.washings.api.dto.response.WashingListResponse;
import com.rushWash.domain.washings.service.WashingService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/washings")
public class WashingRestController {

    private final WashingService washingService;
    private final TokenService tokenService;

    @GetMapping
    public ApiResponse<WashingListResponse> getWashingList(
            @RequestHeader("Authorization") String authHeader) {
        int userId = tokenService.extractUserIdFromHeader(authHeader);
        WashingListResponse response = washingService.getWashingListByUserId(userId);

        return ApiResponse.ok(response);
    }

    @GetMapping("/{washingHistoryId}")
    public ApiResponse<WashingDetailResponse> getWashingDetail(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable int washingHistoryId) {
        int userId = tokenService.extractUserIdFromHeader(authHeader);
        WashingDetailResponse response = washingService.getWashingDetailByUserIdAndWashingHistoryId(userId, washingHistoryId);
        return ApiResponse.ok(response);
    }
}
