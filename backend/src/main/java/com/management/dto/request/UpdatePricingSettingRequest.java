package com.management.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdatePricingSettingRequest {

    @NotNull
    @DecimalMin("0")
    private BigDecimal elecPrice;

    @NotNull
    @DecimalMin("0")
    private BigDecimal waterPrice;

    @Size(max = 10)
    private String currency;
}
