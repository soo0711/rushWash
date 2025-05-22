package com.rushWash.domain.fabricSofteners.domain.repository;

import com.rushWash.domain.fabricSofteners.api.dto.response.FabricSoftenerResponse;
import com.rushWash.domain.fabricSofteners.domain.FabricSoftener;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface FabricSoftenerRepository extends JpaRepository<FabricSoftener,Integer> {

    @Query("SELECT new com.rushWash.domain.fabricSofteners.api.dto.response.FabricSoftenerResponse(f.brand, f.productName, f.imageUrl) " +
            "FROM FabricSoftener f WHERE f.scentCategory = :fabricScent")
    List<FabricSoftenerResponse> findFabricSoftenerListByScentCategory(@Param("fabricScent") String fabricScent);
    List<FabricSoftener> findAllByOrderByScentCategory();

    @Query("SELECT fs.scentCategory, COUNT(fs) FROM FabricSoftener fs GROUP BY fs.scentCategory")
    List<Object[]> countByScentCategory();
}
