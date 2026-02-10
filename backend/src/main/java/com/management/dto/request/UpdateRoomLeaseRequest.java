package com.management.dto.request;

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
public class UpdateRoomLeaseRequest {

    private LocalDate moveInDate;
    private LocalDate moveOutDate;
    private BigDecimal depositAmount;
}
