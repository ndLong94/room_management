package com.management.domain.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "user_platform_payment")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserPlatformPayment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal amount;

    @Column(name = "paid_at", nullable = false)
    private Instant paidAt;

    @Column(length = 500)
    private String note;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    protected void onCreate() {
        if (this.createdAt == null) {
            this.createdAt = Instant.now();
        }
        if (this.paidAt == null) {
            this.paidAt = Instant.now();
        }
    }
}
