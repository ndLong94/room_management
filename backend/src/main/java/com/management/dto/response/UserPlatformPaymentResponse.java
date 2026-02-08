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
public class UserPlatformPaymentResponse {

    private Long id;
    private Long userId;
    private BigDecimal amount;
    private Instant paidAt;
    private String note;
    private Instant createdAt;
}
