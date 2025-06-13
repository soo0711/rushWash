package com.rushWash.domain.fabricSofteners.service;

import com.rushWash.domain.fabricSofteners.api.dto.response.FabricSoftenerResponse;
import com.rushWash.domain.fabricSofteners.domain.FabricSoftener;
import com.rushWash.domain.fabricSofteners.domain.repository.FabricSoftenerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

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

    public int getFabricSoftenerCount() {
        return (int)fabricSoftenerRepository.count();
    }

    public Map<String, Integer> getScentCount() {
        List<Object[]> resultList = fabricSoftenerRepository.countByScentCategory();
        Map<String, Integer> scentCountMap = new HashMap<>();

        for (Object[] row : resultList) {
            String scent = (String) row[0];
            Long count = (Long) row[1];
            scentCountMap.put(scent, count.intValue());
        }

        return scentCountMap;
    }
}
