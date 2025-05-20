package com.rushWash.domain.analysis.api.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public record AnalysisOnlyLabelResponse(
        @JsonProperty("detected_labels")
        List<String> detectedLabels,
        @JsonProperty("label_explanation")
        List<String> labelExplanation
) {
}
