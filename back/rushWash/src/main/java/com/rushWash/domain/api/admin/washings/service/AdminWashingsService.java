package com.rushWash.domain.api.admin.washings.service;

import com.rushWash.common.file.FileManagerService;
import com.rushWash.common.response.CustomException;
import com.rushWash.common.response.ErrorCode;
import com.rushWash.domain.api.admin.washings.api.dto.response.WashingListResponse;
import com.rushWash.domain.washings.domain.WashingHistory;
import com.rushWash.domain.washings.domain.repository.WashingHistoryRepository;
import com.rushWash.domain.washings.service.WashingService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminWashingsService {
    private final WashingService washingService;
    private final FileManagerService fileManagerService;
    private final WashingHistoryRepository washingHistoryRepository;

    public List<WashingListResponse> getWashingList() {
        return washingService.getAdminWashingList();
    }

    public List<WashingListResponse> getWashingGoodList() {
        return washingService.getAdminWashingGoodList();
    }
    public void deleteWashing(int washingHistoryId) {
        WashingHistory washingHistory = washingHistoryRepository.findById(washingHistoryId)
                .orElseThrow(() -> new CustomException(ErrorCode.WASHING_HISTORY_NOT_FOUNT));
        if(washingHistory.getLabelImageUrl() != null) {
            fileManagerService.deleteFile(washingHistory.getLabelImageUrl());
        }

        if(washingHistory.getStainImageUrl() != null) {
            fileManagerService.deleteFile(washingHistory.getStainImageUrl());
        }
        washingHistoryRepository.deleteById(washingHistoryId);
    }
}
