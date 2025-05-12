package com.rushWash.domain.admin.fabricSofteneres.api.dto.request;

public record AdminFabricSoftenerUpdateRequest(
        int fabricSoftenerId,
        String scentCategory,
        String brand,
        String productName
) {
}
