package com.rushWash.domain.fabricSofteners.service;

import com.rushWash.domain.fabricSofteners.api.dto.response.FabricSoftenerResponse;
import com.rushWash.domain.fabricSofteners.domain.FabricSoftener;
import com.rushWash.domain.fabricSofteners.domain.repository.FabricSoftenerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FabricSoftenerService {

    private final FabricSoftenerRepository fabricSoftenerRepository;

    public List<FabricSoftenerResponse> getFabricSoftenerList(String fabricScent){
        return fabricSoftenerRepository.findFabricSoftenerListByScentCategory(fabricScent);
    }

    public List<FabricSoftener> getFabricSoftenerList(){
        return fabricSoftenerRepository.findAllByOrderByScentCategory();
    }

}
