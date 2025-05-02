package com.rushWash.domain.washings.api.dto.response;

import com.rushWash.domain.washings.domain.AnalysisType;

import java.time.LocalDateTime;
import java.util.List;

public record WashingDetailResponse(

        int id,
        String stainImageUrl,
        String labelImageUrl,
        AnalysisType analysisType,
        String stainCategory,
        String analysis,
        boolean estimation,
        LocalDateTime createdAt


) {
}
