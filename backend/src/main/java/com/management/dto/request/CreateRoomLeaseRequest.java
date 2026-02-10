package com.management.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateRoomLeaseRequest {

    @NotNull(message = "ID người thuê là bắt buộc")
    private Long tenantId;

    private LocalDate moveInDate;
    private LocalDate moveOutDate;

    @NotNull(message = "Tiền cọc là bắt buộc")
    private BigDecimal depositAmount;
}
