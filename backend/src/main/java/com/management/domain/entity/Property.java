package com.management.domain.entity;

import jakarta.persistence.*;
import lombok.*;

import com.management.domain.PropertyPricingDefaults;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "properties")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Property {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "owner_user_id", nullable = false, updatable = false)
    private Long ownerUserId;

    @Column(nullable = false, length = 255)
    private String name;

    @Column(length = 500)
    private String address;

    @Column(columnDefinition = "TEXT")
    private String note;

    @Column(name = "elec_price", nullable = false, precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal elecPrice = PropertyPricingDefaults.DEFAULT_ELEC_PRICE;

    @Column(name = "water_price", nullable = false, precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal waterPrice = PropertyPricingDefaults.DEFAULT_WATER_PRICE;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    protected void onCreate() {
        if (this.createdAt == null) {
            this.createdAt = Instant.now();
        }
    }
}
