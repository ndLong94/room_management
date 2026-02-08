package com.management.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

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
    private Instant createdAt;
}
