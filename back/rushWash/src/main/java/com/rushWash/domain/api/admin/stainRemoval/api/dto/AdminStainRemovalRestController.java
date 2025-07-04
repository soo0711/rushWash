package com.rushWash.domain.api.admin.stainRemoval.api.dto;

import com.rushWash.common.response.ApiResponse;
import com.rushWash.domain.api.admin.stainRemoval.api.dto.request.AdminStainRemovalRequest;
import com.rushWash.domain.api.admin.stainRemoval.api.dto.request.AdminStainRemovalUpdateRequest;
import com.rushWash.domain.api.admin.stainRemoval.service.AdminStainRemovalService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/stain-removal")
public class AdminStainRemovalRestController {

    private final AdminStainRemovalService adminStainRemovalServiceService;

    @GetMapping
    public ApiResponse<Map<String, List<String>>> getStainRemovalList() {

        return ApiResponse.ok(adminStainRemovalServiceService.getStainRemovalList());
    }

    @PostMapping
    public ApiResponse<String> addStainRemoval(
            @RequestBody AdminStainRemovalRequest request){
        adminStainRemovalServiceService.addStainRemoval(request.stain(), request.method());

        return ApiResponse.ok("얼룩 제거 방법 생성 완료");
    }

    @PatchMapping
    public ApiResponse<String> updateStainRemoval(
            @RequestBody AdminStainRemovalUpdateRequest request){
        adminStainRemovalServiceService.updateStainRemoval(request.stain(), request.method(), request.updatedMethod());

        return ApiResponse.ok("얼룩 제거 방법 업데이트 완료");
    }

    @DeleteMapping
    public ApiResponse<String> deleteStainRemoval(
            @RequestBody AdminStainRemovalRequest request){
        adminStainRemovalServiceService.deleteStainRemoval(request.stain(), request.method());

        return ApiResponse.ok("얼룩 제거 방법 삭제 완료");
    }
}
