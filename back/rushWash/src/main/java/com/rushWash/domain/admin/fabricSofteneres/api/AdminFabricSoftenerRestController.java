package com.rushWash.domain.admin.fabricSofteneres.api;

import com.rushWash.common.response.ApiResponse;
import com.rushWash.domain.admin.fabricSofteneres.api.dto.request.AdminFabricSoftenerDeleteRequest;
import com.rushWash.domain.admin.fabricSofteneres.api.dto.request.AdminFabricSoftenerRequest;
import com.rushWash.domain.admin.fabricSofteneres.api.dto.request.AdminFabricSoftenerUpdateRequest;
import com.rushWash.domain.admin.fabricSofteneres.service.AdminFabricSoftenerService;
import com.rushWash.domain.fabricSofteners.domain.FabricSoftener;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

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

    @PostMapping
    public ApiResponse<String> addFabricSoftener(
            @RequestPart("request") AdminFabricSoftenerRequest request,
            @RequestPart("file") MultipartFile file){
        adminFabricSoftenerService.addFabricSoftener(request.scentCategory(), request.brand(),request.productName(), file);

        return ApiResponse.ok("섬유유연제 생성 완료");
    }

    @PatchMapping
    public ApiResponse<String> updateFabricSoftenerByFabricSoftenerId(
            @RequestPart("request") AdminFabricSoftenerUpdateRequest request,
            @RequestPart("file") MultipartFile file){
        adminFabricSoftenerService.updateFabricSoftenerByFabricSoftenerId(request.fabricSoftenerId(), request.scentCategory(),
                request.brand(), request.productName(), file);

        return ApiResponse.ok("섬유유연제 업데이트 완료");
    }

    @DeleteMapping
    public ApiResponse<String> deleteFabricSoftenerByFabricSoftenerId(
            @RequestBody AdminFabricSoftenerDeleteRequest request){
        adminFabricSoftenerService.deleteFabricSoftenerByFabricSoftenerId(request.fabricSoftenerId());

        return ApiResponse.ok("섬유유연제 삭제 완료");
    }
}
