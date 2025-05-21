package com.rushWash.domain.washings.api.dto.response;

import com.rushWash.domain.washings.domain.AnalysisType;

import java.time.LocalDateTime;

public record WashingList(
        int washingHistoryId,
        AnalysisType analysisType,
        String analysis,
        Boolean estimation,
        LocalDateTime createdAt
) {
}
