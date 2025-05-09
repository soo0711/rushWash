package com.rushWash.domain.washings.service;

import com.rushWash.common.response.CustomException;
import com.rushWash.common.response.ErrorCode;
import com.rushWash.domain.admin.washings.api.dto.response.WashingListResponse;
import com.rushWash.domain.washings.api.dto.request.WashingEstimationRequest;
import com.rushWash.domain.washings.api.dto.response.WashingDetailResponse;
import com.rushWash.domain.washings.api.dto.response.WashingList;
import com.rushWash.domain.washings.domain.WashingHistory;
import com.rushWash.domain.washings.domain.repository.WashingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class WashingService {

    private final WashingRepository washingRepository;

    public List<WashingList> getWashingListByUserId(int userId) {

        return  washingRepository.findItemsByUserId(userId);

    }

    public WashingDetailResponse getWashingDetailByUserIdAndWashingHistoryId(int userId, int washingHistoryId) {

        return washingRepository.findDetailByUserIdAndWashingHistoryId(userId, washingHistoryId);

    }

    public void updateWashingHistory(int userId, int washingHistoryId, WashingEstimationRequest request) {
        WashingHistory washingHistory = washingRepository.findByIdAndUserId(washingHistoryId, userId);
        if(washingHistory == null) {
            throw new CustomException(ErrorCode.WASHING_HISTORY_NOT_FOUNT);
        }

        washingHistory = washingHistory.toBuilder() // 기존 내용은 그대로
                .estimation(request.estimation())
                .build();
        washingRepository.save(washingHistory); // 데이터 있으면 수정


    }

    public List<WashingListResponse> getAdminWashingList () {
        return washingRepository.getWashingList();
    }

    public List<WashingListResponse> getAdminWashingGoodList () {
        return washingRepository.getWashingGoodList();
    }

}
