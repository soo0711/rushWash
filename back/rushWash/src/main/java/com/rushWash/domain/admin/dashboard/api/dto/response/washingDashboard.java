package com.rushWash.domain.admin.dashboard.api.dto.response;

import com.rushWash.domain.washings.domain.AnalysisType;

import java.time.LocalDateTime;

public record washingDashboard(
        int washingHistoryId,
        String userEmail,
        AnalysisType analysisType,
        Boolean estimation,
        LocalDateTime createdAt
) {
}
