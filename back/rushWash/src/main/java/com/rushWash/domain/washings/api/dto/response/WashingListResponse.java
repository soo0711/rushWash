package com.rushWash.domain.washings.api.dto.response;

import com.rushWash.domain.washings.domain.AnalysisType;

import java.time.LocalDateTime;
import java.util.List;

public record WashingListResponse(
        List<WashingList> WashingList
) {
}
