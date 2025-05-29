package com.rushWash.domain.analysis.api.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public record AnalysisStainAndLabelResponse(
        @JsonProperty("top1_stain")
        String top1Stain,
        @JsonProperty("washing_instruction")
        String washingInstruction,
        @JsonProperty("detected_labels")
        List<String> detectedLabels,
        @JsonProperty("label_explanation")
        List<String> labelExplanation,
        @JsonProperty("output_image_paths")
        OutputImagePaths outputImagePaths,
        @JsonProperty("llm_generated_guide")
        String llmGeneratedGuide
) {
    public record OutputImagePaths(
            @JsonProperty("stain")
            String stain,
            @JsonProperty("label")
            String label
    ) {}
}
