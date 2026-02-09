package com.management.dto.response;

import com.management.domain.enums.RoomStatus;
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
public class RoomResponse {

    private Long id;
    private Long propertyId;
    private String name;
    private BigDecimal rentPrice;
    private RoomStatus status;
    private String contractUrl;
    private Integer paymentDay;
    private BigDecimal depositAmount;
    private LocalDate depositDate;
    private Boolean depositPaid;
    private BigDecimal fixedElecAmount;
    private BigDecimal fixedWaterAmount;
    private BigDecimal initialElecReading;
    private BigDecimal initialWaterReading;
    private Long invoiceRecipientOccupantId;
    private Instant createdAt;
}
