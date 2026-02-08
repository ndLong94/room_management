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
public class PropertyResponse {

    private Long id;
    private Long ownerUserId;
    private String name;
    private String address;
    private String note;
    private BigDecimal elecPrice;
    private BigDecimal waterPrice;
    private Instant createdAt;
}
