package com.rushWash.domain.washings.domain.repository;

import com.rushWash.domain.admin.washings.api.dto.response.WashingListResponse;
import com.rushWash.domain.washings.api.dto.response.WashingDetailResponse;
import com.rushWash.domain.washings.api.dto.response.WashingList;
import com.rushWash.domain.washings.domain.WashingHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface WashingHistoryRepository extends JpaRepository<WashingHistory, Integer> {
    @Query("""
    SELECT new com.rushWash.domain.washings.api.dto.response.WashingList(
        wh.id,
        wh.analysisType,
        (
            SELECT wr.analysis
            FROM WashingResult wr
            WHERE wr.washingHistory.id = wh.id
            ORDER BY wr.id ASC
            LIMIT 1
        ),
        wh.estimation,
        wh.createdAt
    )
    FROM WashingHistory wh
    WHERE wh.userId = :userId
    ORDER BY wh.createdAt DESC
    """)
    List<WashingList> findItemsByUserId(@Param("userId") int userId);


    @Query("""
    SELECT wh
    FROM WashingHistory wh
    LEFT JOIN FETCH wh.washingResults wr
    WHERE wh.userId = :userId AND wh.id = :washingHistoryId
    """)
    Optional<WashingHistory> findWithResultsByUserIdAndWashingHistoryId(
            @Param("userId") int userId,
            @Param("washingHistoryId") int washingHistoryId
    );


    WashingHistory findByIdAndUserId(int id, int userId);


    @Query("""
    SELECT new com.rushWash.domain.admin.washings.api.dto.response.WashingListResponse(
        wh.id,
        u.id,
        u.email,
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
    JOIN User u ON u.id = wh.userId
    ORDER BY wh.createdAt DESC
    """)
    List<WashingListResponse> getWashingList();

    @Query("""
    SELECT new com.rushWash.domain.admin.washings.api.dto.response.WashingListResponse(
        wh.id,
        u.id,
        u.email,
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
    JOIN User u ON u.id = wh.userId
    WHERE wh.estimation = true
    ORDER BY wh.createdAt DESC
    """)
    List<WashingListResponse> getWashingGoodList();
}
