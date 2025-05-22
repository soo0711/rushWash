package com.rushWash.domain.admin.dashboard.service;

import com.rushWash.domain.admin.dashboard.api.dto.response.AdminDashboardResponse;
import com.rushWash.domain.admin.dashboard.api.dto.response.washingDashboard;
import com.rushWash.domain.fabricSofteners.domain.FabricSoftener;
import com.rushWash.domain.fabricSofteners.service.FabricSoftenerService;
import com.rushWash.domain.users.service.UserService;
import com.rushWash.domain.washings.service.WashingService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AdminDashboardService {
    private final WashingService washingService;
    private final UserService userService;
    private final FabricSoftenerService fabricSoftenerService;

    public AdminDashboardResponse getDashboard() {
        int userCount = userService.getUserCount();
        int fabricSoftenerCount = fabricSoftenerService.getFabricSoftenerCount();
        int washingHistoryCount = washingService.getWashingCount();
        List<washingDashboard> washingHistory = washingService.getAdminDashboardWashingList();
        Map<String, Integer> scentCount = fabricSoftenerService.getScentCount();
        List<FabricSoftener> fabricSoftenerList = fabricSoftenerService.getFabricSoftenerList();
        AdminDashboardResponse adminDashboard = new AdminDashboardResponse(
                userCount,
                fabricSoftenerCount,
                washingHistoryCount,
                washingHistory,
                scentCount,
                fabricSoftenerList
        );

        return adminDashboard;
    }
}
