package com.rushWash.domain.analysis.service;

import com.rushWash.domain.washings.domain.WashingHistory;
import com.rushWash.domain.washings.domain.WashingResult;
import com.rushWash.domain.washings.domain.repository.WashingRepository;
import com.rushWash.domain.washings.service.WashingService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class AnalysisService {

    private final WashingService washingService;

    public void getStainAnalysis(int userId, MultipartFile file){

    }

    public void getLabelAnalysis(int userId, MultipartFile file){

    }

    public void getStainAndLabelAnalysis(int userId, MultipartFile file){

    }
}
