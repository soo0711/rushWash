package com.rushWash.domain.admin.washings.api.dto.response;

import com.rushWash.domain.washings.domain.AnalysisType;

import java.time.LocalDateTime;

public record WashingListResponse(
        int washingHistoryId,
        int userId,
        AnalysisType analysisType,
        String stain_image_url,
        String label_image_url,
        String stainCategory,
        String analysis,
        Boolean estimation,
        LocalDateTime createdAt
) {
}
