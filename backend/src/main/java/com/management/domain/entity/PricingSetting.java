package com.management.domain.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "pricing_settings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PricingSetting {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "owner_user_id", nullable = false, unique = true, updatable = false)
    private Long ownerUserId;

    @Column(name = "elec_price", nullable = false, precision = 12, scale = 4)
    @Builder.Default
    private BigDecimal elecPrice = BigDecimal.ZERO;

    @Column(name = "water_price", nullable = false, precision = 12, scale = 4)
    @Builder.Default
    private BigDecimal waterPrice = BigDecimal.ZERO;

    @Column(nullable = false, length = 10)
    @Builder.Default
    private String currency = "VND";

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = Instant.now();
    }
}
