package com.rushWash.domain.fabricSofteners.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@ToString
@Table(name = "fabric_softener")
@Builder
@Getter
@AllArgsConstructor
@NoArgsConstructor
public class FabricSoftener {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;
    @Column(name = "scent_category")
    private String scentCategory;
    private String brand;
    @Column(name = "product_name")
    private String productName;
    @Column(name = "created_at", updatable = false)
    @UpdateTimestamp
    private LocalDateTime createdAt;
    @Column(name = "updated_at")
    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public void updateInfo(String scentCategory, String brand, String productName) {
        this.scentCategory = scentCategory;
        this.brand = brand;
        this.productName = productName;
    }
}
