package com.management.dto.response;

import com.management.domain.enums.InvoiceStatus;
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
public class InvoiceResponse {

    private Long id;
    private Long propertyId;
    private String propertyName;
    private Long roomId;
    private String roomName;
    private Integer month;
    private Integer year;
    private LocalDate dueDate;
    private BigDecimal rentAmount;
    private BigDecimal elecAmount;
    private BigDecimal waterAmount;
    private BigDecimal otherAmount;
    private BigDecimal totalAmount;
    private InvoiceStatus status;
    private Instant paidAt;
    private String paymentMethod;
    private Instant createdAt;
}
