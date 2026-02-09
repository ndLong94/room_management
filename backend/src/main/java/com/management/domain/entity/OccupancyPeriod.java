package com.management.domain.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "occupancy_periods")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OccupancyPeriod {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "room_id", nullable = false, updatable = false)
    private Long roomId;

    @Column(name = "property_id", nullable = false, updatable = false)
    private Long propertyId;

    @Column(name = "start_month")
    private Integer startMonth;

    @Column(name = "start_year")
    private Integer startYear;

    @Column(name = "end_month", nullable = false)
    private Integer endMonth;

    @Column(name = "end_year", nullable = false)
    private Integer endYear;

    @Column(name = "deposit_amount", precision = 15, scale = 2)
    private BigDecimal depositAmount;

    @Column(name = "deposit_date")
    private LocalDate depositDate;

    @Column(name = "payment_day")
    private Integer paymentDay;

    @Column(name = "contract_url", length = 1000)
    private String contractUrl;

    /** Số điện cuối cùng khi chuyển từ cho thuê sang trống */
    @Column(name = "final_elec_reading", precision = 12, scale = 2)
    private BigDecimal finalElecReading;

    /** Số nước cuối cùng khi chuyển từ cho thuê sang trống */
    @Column(name = "final_water_reading", precision = 12, scale = 2)
    private BigDecimal finalWaterReading;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    protected void onCreate() {
        if (this.createdAt == null) {
            this.createdAt = Instant.now();
        }
    }
}
