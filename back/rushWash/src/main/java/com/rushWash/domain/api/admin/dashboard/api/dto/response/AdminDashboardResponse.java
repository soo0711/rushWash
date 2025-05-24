package com.rushWash.domain.api.admin.dashboard.api.dto.response;

import com.rushWash.domain.fabricSofteners.domain.FabricSoftener;

import java.util.List;
import java.util.Map;

public record AdminDashboardResponse(
        int userCount,
        int fabricSoftenerCount,
        int washingHistoryCount,
        List<washingDashboard> washingHistory,
        Map<String, Integer> scentCount,
        List<FabricSoftener> fabricSoftenerList

) {
}
