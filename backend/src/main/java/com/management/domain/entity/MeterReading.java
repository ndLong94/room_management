package com.management.domain.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "meter_readings", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"room_id", "month", "year"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MeterReading {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "room_id", nullable = false, updatable = false)
    private Long roomId;

    @Column(nullable = false)
    private Integer month;

    @Column(nullable = false)
    private Integer year;

    @Column(name = "elec_reading", nullable = false, precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal elecReading = BigDecimal.ZERO;

    @Column(name = "water_reading", nullable = false, precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal waterReading = BigDecimal.ZERO;
}
