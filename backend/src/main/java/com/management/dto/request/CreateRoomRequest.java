package com.management.dto.request;

import com.management.domain.enums.RoomStatus;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
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
public class CreateRoomRequest {

    @NotBlank(message = "Name is required")
    @Size(max = 255)
    private String name;

    @NotNull
    @DecimalMin("0")
    @Builder.Default
    private BigDecimal rentPrice = BigDecimal.ZERO;

    @Builder.Default
    private RoomStatus status = RoomStatus.VACANT;

    private Integer paymentDay;
}
