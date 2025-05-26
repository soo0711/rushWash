package com.rushWash.domain.washings.service;

import com.rushWash.common.response.CustomException;
import com.rushWash.common.response.ErrorCode;
import com.rushWash.domain.api.admin.dashboard.api.dto.response.washingDashboard;
import com.rushWash.domain.api.admin.washings.api.dto.response.WashingListResponse;
import com.rushWash.domain.washings.api.dto.request.WashingEstimationRequest;
import com.rushWash.domain.washings.api.dto.response.WashingDetailResponse;
import com.rushWash.domain.washings.api.dto.response.WashingList;
import com.rushWash.domain.washings.domain.AnalysisType;
import com.rushWash.domain.washings.domain.WashingHistory;
import com.rushWash.domain.washings.domain.WashingResult;
import com.rushWash.domain.washings.domain.repository.WashingHistoryRepository;
import com.rushWash.domain.washings.domain.repository.WashingResultRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
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

        WashingHistory wh = washingHistoryRepository
                .findWithResultsByUserIdAndWashingHistoryId(userId, washingHistoryId)
                .orElseThrow(() -> new CustomException(ErrorCode.WASHING_HISTORY_NOT_FOUNT));

        return new WashingDetailResponse(
                wh.getId(),
                wh.getStainImageUrl(),
                wh.getLabelImageUrl(),
                wh.getAnalysisType(),
                wh.getEstimation(),
                wh.getCreatedAt(),
                wh.getWashingResults() // 연관된 List<WashingResult>
        );

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

    public WashingHistory addWashingHistoryByStainImage(int userId, AnalysisType analysisType, String imageUrl){
        WashingHistory washingHistory = washingHistoryRepository.save(
                WashingHistory.builder()
                        .userId(userId)
                        .analysisType(analysisType)
                        .stainImageUrl(imageUrl)
                        .build()
        );
        return washingHistory;
    }

    public WashingHistory addWashingHistoryByLabelImage(int userId, AnalysisType analysisType, String imageUrl){
        WashingHistory washingHistory = washingHistoryRepository.save(
                WashingHistory.builder()
                        .userId(userId)
                        .analysisType(analysisType)
                        .labelImageUrl(imageUrl)
                        .build()
        );
        return washingHistory;
    }

    public WashingHistory addWashingHistoryByStainAndLabelImage(int userId, AnalysisType analysisType, String stainImageUrl, String labelImageUrl){
        System.out.println(">>> addWashingHistoryByStainAndLabelImage 호출됨");
        System.out.println("userId: " + userId);
        System.out.println("analysisType: " + analysisType);
        System.out.println("stainImageUrl: " + stainImageUrl);
        System.out.println("labelImageUrl: " + labelImageUrl);
        WashingHistory washingHistory = washingHistoryRepository.save(
                WashingHistory.builder()
                        .userId(userId)
                        .analysisType(analysisType)
                        .stainImageUrl(stainImageUrl)
                        .labelImageUrl(labelImageUrl)
                        .build()
        );
        System.out.println("저장 완료, id: " + washingHistory.getId());
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

    public int getWashingCount() {
        return (int)washingHistoryRepository.count();
    }

    public List<washingDashboard> getAdminDashboardWashingList() {
        return washingHistoryRepository.getAdminDashboardWashingList(PageRequest.of(0, 5));
    }
}
