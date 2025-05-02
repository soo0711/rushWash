package com.rushWash.domain.fabricSofteners.domain.repository;

import com.rushWash.domain.fabricSofteners.api.dto.response.FabricSoftenerResponse;
import com.rushWash.domain.fabricSofteners.domain.FabricSoftener;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface FabricSoftenerRepository extends JpaRepository<FabricSoftener,Integer> {

    @Query("SELECT new com.rushWash.domain.fabricSofteners.api.dto.response.FabricSoftenerResponse(f.brand, f.productName) " +
            "FROM FabricSoftener f WHERE f.scentCategoryId = :scentCategoryId")
    List<FabricSoftenerResponse> findFabricSoftenerListByScentCategoryId(@Param("scentCategoryId") int scentCategoryId);
}
