package com.rushWash.domain.washings.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;


@Entity
@ToString
@Table(name="washing_result")
@Getter
@Builder(toBuilder = true)
@NoArgsConstructor
@AllArgsConstructor
public class WashingResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "washing_history_id", nullable = false)
    @JsonIgnore
    private WashingHistory washingHistory;
    @Column(name = "stain_category")
    private String stainCategory;

    private String analysis;
/*
    @Column(name = "created_at", updatable = false)
    @UpdateTimestamp
    private LocalDateTime createdAt;
    @Column(name = "updated_at")
    @UpdateTimestamp
    private LocalDateTime updatedAt;
 */

}
