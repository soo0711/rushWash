package com.rushWash.domain.api.admin.dashboard.api;

import com.rushWash.common.response.ApiResponse;
import com.rushWash.domain.api.admin.dashboard.api.dto.response.AdminDashboardResponse;
import com.rushWash.domain.api.admin.dashboard.service.AdminDashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin")
public class AdminDashboardController {

    private final AdminDashboardService adminDashboardService;

    @GetMapping("/dashboard")
    public ApiResponse<AdminDashboardResponse> getDashboard ( ) {
        return ApiResponse.ok(adminDashboardService.getDashboard());
    }
}
