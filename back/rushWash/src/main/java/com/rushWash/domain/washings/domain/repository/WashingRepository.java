package com.rushWash.domain.washings.domain.repository;

import com.rushWash.domain.admin.washings.api.dto.response.WashingListResponse;
import com.rushWash.domain.users.domain.User;
import com.rushWash.domain.washings.api.dto.request.WashingEstimationRequest;
import com.rushWash.domain.washings.api.dto.response.WashingDetailResponse;
import com.rushWash.domain.washings.api.dto.response.WashingList;
import com.rushWash.domain.washings.domain.WashingHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface WashingRepository extends JpaRepository<WashingHistory, Integer> {
    @Query("""
    SELECT new com.rushWash.domain.washings.api.dto.response.WashingList(
        wh.id,
        wh.analysisType,
        wr.analysis,
        wh.estimation,
        wh.createdAt
    )
    FROM WashingHistory wh
    JOIN WashingResult wr ON wr.washingHistory.id = wh.id
    WHERE wh.userId = :userId
    ORDER BY wh.createdAt DESC
""")
    List<WashingList> findItemsByUserId(@Param("userId") int userId);


     @Query("""
    SELECT new com.rushWash.domain.washings.api.dto.response.WashingDetailResponse(
        wh.id,
        wh.stainImageUrl,
        wh.labelImageUrl,
        wh.analysisType,
        wr.stainCategory,
        wr.analysis,
        wh.estimation,
        wh.createdAt
    )
    FROM WashingHistory wh
    JOIN WashingResult wr ON wr.washingHistory.id = wh.id
    WHERE wh.userId = :userId AND wh.id = :washingHistoryId
    ORDER BY wh.createdAt DESC
""")
    WashingDetailResponse findDetailByUserIdAndWashingHistoryId(@Param("userId") int userId, @Param(("washingHistoryId")) int washingHistoryId);


    WashingHistory findByIdAndUserId(int id, int userId);


    @Query("""
    SELECT new com.rushWash.domain.admin.washings.api.dto.response.WashingListResponse(
        wh.id,
        wh.userId,
        wh.analysisType,
        wh.stainImageUrl,
        wh.labelImageUrl,
        wr.stainCategory,
        wr.analysis,
        wh.estimation,
        wh.createdAt
    )
    FROM WashingHistory wh
    JOIN WashingResult wr ON wr.washingHistory.id = wh.id
    ORDER BY wh.createdAt DESC
    
            """)
    List<WashingListResponse> getWashingList();

    @Query("""
    SELECT new com.rushWash.domain.admin.washings.api.dto.response.WashingListResponse(
        wh.id,
        wh.userId,
        wh.analysisType,
        wh.stainImageUrl,
        wh.labelImageUrl,
        wr.stainCategory,
        wr.analysis,
        wh.estimation,
        wh.createdAt
    )
    FROM WashingHistory wh
    JOIN WashingResult wr ON wr.washingHistory.id = wh.id
    WHERE wh.estimation = true
    ORDER BY wh.createdAt DESC

            """)
    List<WashingListResponse> getWashingGoodList();
}
