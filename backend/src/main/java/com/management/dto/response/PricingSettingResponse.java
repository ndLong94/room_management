package com.management.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PricingSettingResponse {

    private Long id;
    private Long ownerUserId;
    private BigDecimal elecPrice;
    private BigDecimal waterPrice;
    private String currency;
    private Instant updatedAt;
}
