package com.rushWash.domain.api.admin.stainRemoval.api.dto.request;

public record AdminStainRemovalUpdateRequest(
        String stain,
        String method,
        String updatedMethod
) {
}
