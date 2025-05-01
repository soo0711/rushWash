package com.rushWash.domain.washings.api;

import com.rushWash.common.response.ApiResponse;
import com.rushWash.domain.users.api.dto.request.UserDuplicateCheckRequest;
import com.rushWash.domain.washings.api.dto.request.WashingDetailRequest;
import com.rushWash.domain.washings.api.dto.response.WashingDetailResponse;
import com.rushWash.domain.washings.api.dto.response.WashingListResponse;
import com.rushWash.domain.washings.service.WashingService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/washings")
public class WasingRestController {

    private final WashingService washingService;
    //private final Tokense

    @GetMapping
    public ApiResponse<WashingListResponse> getWashingList(
            /*@RequestHeader("Authorization") String authHeader*/) {
        int userId = 1; // userID
        WashingListResponse response = washingService.getWashingListByUserId(userId);

        return ApiResponse.ok(response);
    }

    @GetMapping("/{washingHistoryId}")
    public ApiResponse<WashingDetailResponse> getWashingDetail(
            /*@RequestHeader("Authorization") String authHeader*/
            @PathVariable int washingHistoryId) {
        int userId = 1; // userID
        WashingDetailResponse response = washingService.getWashingDetailByUserIdAndWashingHistoryId(userId, washingHistoryId);
        return ApiResponse.ok(response);
    }
}
