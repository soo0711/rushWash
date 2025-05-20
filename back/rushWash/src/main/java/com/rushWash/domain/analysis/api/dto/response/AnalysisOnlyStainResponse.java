package com.rushWash.domain.analysis.api.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public record AnalysisOnlyStainResponse(
        DetectedStain detectedStain,
        List<WashingInstruction> washingInstructions
) {
    public record DetectedStain(
            List<Top3> top3
    ) {
        public record Top3(
                @JsonProperty("class") String clazz,
                double confidence
        ) {}
    }

    public record WashingInstruction(
            @JsonProperty("class") String clazz,
            String instruction
    ) {}
}
