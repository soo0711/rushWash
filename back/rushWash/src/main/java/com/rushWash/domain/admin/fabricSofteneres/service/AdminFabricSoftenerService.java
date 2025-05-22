package com.rushWash.domain.admin.fabricSofteneres.service;

import com.rushWash.common.file.FileManagerService;
import com.rushWash.common.response.CustomException;
import com.rushWash.common.response.ErrorCode;
import com.rushWash.domain.fabricSofteners.domain.FabricSoftener;
import com.rushWash.domain.fabricSofteners.domain.repository.FabricSoftenerRepository;
import com.rushWash.domain.fabricSofteners.service.FabricSoftenerService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminFabricSoftenerService {

    private final FabricSoftenerService fabricSoftenerService;
    private final FabricSoftenerRepository fabricSoftenerRepository;
    private final FileManagerService fileManagerService;

    public List<FabricSoftener> getFabricSoftenerList(){
        return fabricSoftenerService.getFabricSoftenerList();
    }

    public void addFabricSoftener(String scentCategory, String brand, String productName, MultipartFile file){
        // 이미지 저장
        String path = fileManagerService.saveFile(scentCategory, file);

        fabricSoftenerRepository.save(
                FabricSoftener.builder()
                        .scentCategory(scentCategory)
                        .brand(brand)
                        .productName(productName)
                        .imageUrl(path)
                        .build()
        );
    }

    @Transactional
    public void updateFabricSoftenerByFabricSoftenerId(int fabricSoftenerId, String scentCategory, String brand, String productName, MultipartFile file){
        FabricSoftener fabricSoftener = fabricSoftenerRepository.findById(fabricSoftenerId)
                .orElseThrow(() -> new CustomException(ErrorCode.FABRIC_CATEGORY_NOT_FOUND));
        // 원래 있던거 삭제
        fileManagerService.deleteFabricSoftenerFile(fabricSoftener.getImageUrl());
        // 후 저장
        String path = fileManagerService.saveFile(fabricSoftener.getScentCategory(), file);
        fabricSoftener.updateInfo(scentCategory, brand, productName, path);
    }

    public void deleteFabricSoftenerByFabricSoftenerId(int fabricSoftenerId){
        FabricSoftener fabricSoftener = fabricSoftenerRepository.findById(fabricSoftenerId)
                .orElseThrow(() -> new CustomException(ErrorCode.FABRIC_CATEGORY_NOT_FOUND));
        // 이미지 삭제
        fileManagerService.deleteFabricSoftenerFile(fabricSoftener.getImageUrl());

        fabricSoftenerRepository.deleteById(fabricSoftenerId);
    }
}
