package com.management.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardSummaryResponse {

    private long totalRooms;
    private long occupiedRooms;
    private long vacantRooms;
    private BigDecimal totalReceivable;
    private BigDecimal totalCollected;
}
