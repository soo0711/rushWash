package com.rushWash.domain.washings.service;

import com.rushWash.common.response.CustomException;
import com.rushWash.common.response.ErrorCode;
import com.rushWash.domain.admin.washings.api.dto.response.WashingListResponse;
import com.rushWash.domain.users.domain.User;
import com.rushWash.domain.washings.api.dto.request.WashingEstimationRequest;
import com.rushWash.domain.washings.api.dto.response.WashingDetailResponse;
import com.rushWash.domain.washings.api.dto.response.WashingList;
import com.rushWash.domain.washings.domain.AnalysisType;
import com.rushWash.domain.washings.domain.WashingHistory;
import com.rushWash.domain.washings.domain.WashingResult;
import com.rushWash.domain.washings.domain.repository.WashingHistoryRepository;
import com.rushWash.domain.washings.domain.repository.WashingResultRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class WashingService {

    private final WashingHistoryRepository washingHistoryRepository;
    private final WashingResultRepository washingResultRepository;

    public List<WashingList> getWashingListByUserId(int userId) {

        return  washingHistoryRepository.findItemsByUserId(userId);

    }

    public WashingDetailResponse getWashingDetailByUserIdAndWashingHistoryId(int userId, int washingHistoryId) {

        return washingHistoryRepository.findDetailByUserIdAndWashingHistoryId(userId, washingHistoryId);

    }

    public void updateWashingHistory(int userId, int washingHistoryId, WashingEstimationRequest request) {
        WashingHistory washingHistory = washingHistoryRepository.findByIdAndUserId(washingHistoryId, userId);
        if(washingHistory == null) {
            throw new CustomException(ErrorCode.WASHING_HISTORY_NOT_FOUNT);
        }

        washingHistory = washingHistory.toBuilder() // 기존 내용은 그대로
                .estimation(request.estimation())
                .build();
        washingHistoryRepository.save(washingHistory); // 데이터 있으면 수정


    }

    public List<WashingListResponse> getAdminWashingList () {
        return washingHistoryRepository.getWashingList();
    }

    public List<WashingListResponse> getAdminWashingGoodList () {
        return washingHistoryRepository.getWashingGoodList();
    }

    public WashingHistory addWashingHistory(int userId, AnalysisType analysisType, String imageUrl){
        WashingHistory washingHistory = washingHistoryRepository.save(
                WashingHistory.builder()
                        .userId(userId)
                        .analysisType(analysisType)
                        .stainImageUrl(imageUrl)
                        .build()
        );
        return washingHistory;
    }

    public void addWashingResult(WashingHistory washingHistory, String stainCategory, String analysis){
        WashingResult washingResult = washingResultRepository.save(
                WashingResult.builder()
                        .washingHistory(washingHistory)
                        .stainCategory(stainCategory)
                        .analysis(analysis)
                        .build()
        );
    }

}
