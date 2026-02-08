package com.management.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SetPlatformPriceRequest {

    @NotNull
    @DecimalMin("0")
    private BigDecimal amount;

    private String note;
}
