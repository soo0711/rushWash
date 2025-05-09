package com.rushWash.domain.admin.fabricSofteneres.api;

import com.rushWash.common.response.ApiResponse;
import com.rushWash.domain.admin.fabricSofteneres.api.dto.request.AdminFabricSoftenerDeleteRequest;
import com.rushWash.domain.admin.fabricSofteneres.api.dto.request.AdminFabricSoftenerUpdateRequest;
import com.rushWash.domain.admin.fabricSofteneres.service.AdminFabricSoftenerService;
import com.rushWash.domain.fabricSofteners.domain.FabricSoftener;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/admin/fabric-softeners")
public class AdminFabricSoftenerRestController {

    private final AdminFabricSoftenerService adminFabricSoftenerService;

    @GetMapping
    public ApiResponse<List<FabricSoftener>> getFabricSoftenerList() {

        return ApiResponse.ok(adminFabricSoftenerService.getFabricSoftenerList());
    }

    @PatchMapping
    public ApiResponse<String> updateFabricSoftenerByFabricSoftenerId(
            @RequestBody AdminFabricSoftenerUpdateRequest request){
        adminFabricSoftenerService.updateFabricSoftenerByFabricSoftenerId(request.fabricSoftenerId(), request.scentCategory(),
                request.brand(), request.productName());

        return ApiResponse.ok("섬유유연제 업데이트 완료");
    }

    @DeleteMapping
    public ApiResponse<String> deleteFabricSoftenerByFabricSoftenerId(
            @RequestBody AdminFabricSoftenerDeleteRequest request){
        adminFabricSoftenerService.deleteFabricSoftenerByFabricSoftenerId(request.fabricSoftenerId());

        return ApiResponse.ok("섬유유연제 삭제 완료");
    }
}
