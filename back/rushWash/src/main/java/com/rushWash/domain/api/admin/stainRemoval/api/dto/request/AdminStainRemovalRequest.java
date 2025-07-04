package com.rushWash.domain.api.admin.stainRemoval.api.dto.request;

public record AdminStainRemovalRequest(
        String stain,
        String method
) {
}
