package com.rushWash.domain.admin.fabricSofteneres.service;

import com.rushWash.common.response.CustomException;
import com.rushWash.common.response.ErrorCode;
import com.rushWash.domain.fabricSofteners.domain.FabricSoftener;
import com.rushWash.domain.fabricSofteners.domain.repository.FabricSoftenerRepository;
import com.rushWash.domain.fabricSofteners.service.FabricSoftenerService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminFabricSoftenerService {

    private final FabricSoftenerService fabricSoftenerService;
    private final FabricSoftenerRepository fabricSoftenerRepository;

    public List<FabricSoftener> getFabricSoftenerList(){
        return fabricSoftenerService.getFabricSoftenerList();
    }

    public void addFabricSoftener(String scentCategory, String brand, String productName){
        fabricSoftenerRepository.save(
                FabricSoftener.builder()
                        .scentCategory(scentCategory)
                        .brand(brand)
                        .productName(productName)
                        .build()
        );
    }

    @Transactional
    public void updateFabricSoftenerByFabricSoftenerId(int fabricSoftenerId, String scentCategory, String brand, String productName){
        FabricSoftener fabricSoftener = fabricSoftenerRepository.findById(fabricSoftenerId)
                .orElseThrow(() -> new CustomException(ErrorCode.FABRIC_CATEGORY_NOT_FOUND));
        fabricSoftener.updateInfo(scentCategory, brand, productName);
    }

    public void deleteFabricSoftenerByFabricSoftenerId(int fabricSoftenerId){
        fabricSoftenerRepository.findById(fabricSoftenerId)
                .orElseThrow(() -> new CustomException(ErrorCode.FABRIC_CATEGORY_NOT_FOUND));

        fabricSoftenerRepository.deleteById(fabricSoftenerId);
    }
}
