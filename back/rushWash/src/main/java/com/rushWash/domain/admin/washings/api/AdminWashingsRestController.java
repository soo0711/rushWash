package com.rushWash.domain.admin.washings.api;

import com.rushWash.common.response.ApiResponse;
import com.rushWash.domain.admin.washings.api.dto.request.AdminWashingDeleteRequest;
import com.rushWash.domain.admin.washings.api.dto.response.WashingListResponse;
import com.rushWash.domain.admin.washings.service.AdminWashingsService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/admin/washings")
public class AdminWashingsRestController {
    private final AdminWashingsService adminWashingsService;

    @GetMapping
    public ApiResponse<List<WashingListResponse>> getWashingList() {

        return ApiResponse.ok(adminWashingsService.getWashingList());
    }

    @GetMapping("/good")
    public ApiResponse<List<WashingListResponse>> getWashingGoodList() {

        return ApiResponse.ok(adminWashingsService.getWashingGoodList());
    }

    @DeleteMapping
    public ApiResponse<String> deleteWashing(
            @RequestBody AdminWashingDeleteRequest request) {
        adminWashingsService.deleteWashing(request.washingHistoryId());

        return ApiResponse.ok("분석 내역 삭제 완료");
    }

}
