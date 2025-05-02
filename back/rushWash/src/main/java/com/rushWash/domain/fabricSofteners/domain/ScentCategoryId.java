package com.rushWash.domain.fabricSofteners.domain;

import com.rushWash.common.response.CustomException;
import com.rushWash.common.response.ErrorCode;

public enum ScentCategoryId {
    REFRESHING(1),
    FLORAL(2),
    FRUITY(3),
    WOODY(4),
    POWDERY(5),
    CITRUS(6);

    private final int value;

    ScentCategoryId(int value) {
        this.value = value;
    }

    public int getValue() {
        return value;
    }

    public static int fromValue(String category){
        for (ScentCategoryId scentCategoryId : values()){
            if (scentCategoryId.name().equalsIgnoreCase(category)){
                return scentCategoryId.getValue();
            }
        }
        throw new CustomException(ErrorCode.FABRIC_CATEGORY_NOT_FOUND);
    }
}
