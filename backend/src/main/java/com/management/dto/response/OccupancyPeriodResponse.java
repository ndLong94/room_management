package com.management.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OccupancyPeriodResponse {

    private Long id;
    private Long roomId;
    private Long propertyId;
    private Integer startMonth;
    private Integer startYear;
    private Integer endMonth;
    private Integer endYear;
    private BigDecimal depositAmount;
    private LocalDate depositDate;
    private Integer paymentDay;
    private String contractUrl;
    private BigDecimal finalElecReading;
    private BigDecimal finalWaterReading;
    private Instant createdAt;
}
