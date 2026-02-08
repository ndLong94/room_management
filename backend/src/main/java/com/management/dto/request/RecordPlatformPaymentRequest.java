package com.management.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RecordPlatformPaymentRequest {

    @NotNull
    @DecimalMin("0")
    private BigDecimal amount;

    private Instant paidAt; // optional, default now

    private String note;
}
