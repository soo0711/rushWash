package com.rushWash.domain.washings.domain.repository;

import com.rushWash.domain.washings.domain.WashingResult;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WashingResultRepository extends JpaRepository<WashingResult, Integer> {
}
