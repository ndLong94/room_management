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
public class RoomLeaseResponse {

    private Long id;
    private Long roomId;
    private Long tenantId;
    private Boolean active;
    private LocalDate moveInDate;
    private LocalDate moveOutDate;
    private BigDecimal depositAmount;
    private Instant createdAt;
    /** Populated when requested with tenant info */
    private TenantResponse tenant;
}
