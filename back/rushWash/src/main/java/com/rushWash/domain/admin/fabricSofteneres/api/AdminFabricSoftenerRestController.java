package com.rushWash.domain.admin.fabricSofteneres.api;

import com.rushWash.common.response.ApiResponse;
import com.rushWash.domain.admin.fabricSofteneres.api.dto.request.AdminFabricSoftenerUpdateRequest;
import com.rushWash.domain.admin.fabricSofteneres.service.AdminFabricSoftenerService;
import com.rushWash.domain.fabricSofteners.domain.FabricSoftener;
import io.swagger.v3.oas.annotations.parameters.RequestBody;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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

}
