package com.rushWash.domain.analysis.api.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public record AnalysisOnlyStainResponse(
        @JsonProperty("detected_stain")
        DetectedStain detectedStain,
        @JsonProperty("washing_instructions")
        List<WashingInstruction> washingInstructions,

        @JsonProperty("output_image_path")
        String outputImagePath
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
            @JsonProperty("instructions") List<String> instructions
    ) {}
}
