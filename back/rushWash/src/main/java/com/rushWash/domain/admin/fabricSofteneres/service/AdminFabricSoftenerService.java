package com.rushWash.domain.admin.fabricSofteneres.service;

import com.rushWash.domain.fabricSofteners.domain.FabricSoftener;
import com.rushWash.domain.fabricSofteners.domain.repository.FabricSoftenerRepository;
import com.rushWash.domain.fabricSofteners.service.FabricSoftenerService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminFabricSoftenerService {

    private final FabricSoftenerService fabricSoftenerService;
    private final FabricSoftenerRepository fabricSoftenerRepository;

    public List<FabricSoftener> getFabricSoftenerList(){
        return fabricSoftenerService.getFabricSoftenerList();
    }
}
