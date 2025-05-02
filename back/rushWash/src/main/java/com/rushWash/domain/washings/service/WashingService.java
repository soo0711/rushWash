package com.rushWash.domain.washings.service;

import com.rushWash.domain.washings.api.dto.response.WashingDetailResponse;
import com.rushWash.domain.washings.api.dto.response.WashingList;
import com.rushWash.domain.washings.api.dto.response.WashingListResponse;
import com.rushWash.domain.washings.domain.repository.WashingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class WashingService {

    private final WashingRepository washingRepository;

    public WashingListResponse getWashingListByUserId(int userId) {
        List<WashingList> list = washingRepository.findItemsByUserId(userId);
        return new WashingListResponse(list);

    }

    public WashingDetailResponse getWashingDetailByUserIdAndWashingHistoryId(int userId, int washingHistoryId) {

        return washingRepository.findDetailByUserIdAndWashingHistoryId(userId, washingHistoryId);

    }

}
