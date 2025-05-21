package com.rushWash.domain.washings.api.dto.response;

import com.rushWash.domain.washings.domain.AnalysisType;
import com.rushWash.domain.washings.domain.WashingResult;

import java.time.LocalDateTime;
import java.util.List;

public record WashingDetailResponse(

        int id,
        String stainImageUrl,
        String labelImageUrl,
        AnalysisType analysisType,
        Boolean estimation,
        LocalDateTime createdAt,

        List<WashingResult> washingList

) {
}
