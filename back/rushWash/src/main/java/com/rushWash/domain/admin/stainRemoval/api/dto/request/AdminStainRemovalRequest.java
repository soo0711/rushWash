package com.rushWash.domain.admin.stainRemoval.api.dto.request;

public record AdminStainRemovalRequest(
        String stain,
        String method
) {
}
