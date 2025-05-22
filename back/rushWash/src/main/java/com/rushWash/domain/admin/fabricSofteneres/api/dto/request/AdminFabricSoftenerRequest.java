package com.rushWash.domain.admin.fabricSofteneres.api.dto.request;

import org.springframework.web.multipart.MultipartFile;

public record AdminFabricSoftenerRequest(
        String scentCategory,
        String brand,
        String productName
) {
}
