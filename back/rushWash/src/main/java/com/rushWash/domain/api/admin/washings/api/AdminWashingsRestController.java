package com.rushWash.domain.api.admin.washings.api;

import com.rushWash.common.response.ApiResponse;
import com.rushWash.common.response.CustomException;
import com.rushWash.common.response.ErrorCode;
import com.rushWash.domain.api.admin.washings.api.dto.request.AdminWashingDeleteRequest;
import com.rushWash.domain.api.admin.washings.api.dto.response.WashingListResponse;
import com.rushWash.domain.api.admin.washings.service.AdminWashingsService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/washings")
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

    @PostMapping("/re-training")
    public ApiResponse reLearning() {
        try {
            adminWashingsService.reLearningAI();
            return ApiResponse.ok("AI 재학습 완료");
        } catch (CustomException e) {
            return ApiResponse.fail(e.getErrorCode());
        } catch (Exception e) {
            return ApiResponse.fail(ErrorCode.PYTHON_SCRIPT_EXECUTION_FAILED); // fallback
        }
    }

}
