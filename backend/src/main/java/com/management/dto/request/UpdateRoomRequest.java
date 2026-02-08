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
public class UpdateRoomRequest {

    @NotBlank(message = "Name is required")
    @Size(max = 255)
    private String name;

    @NotNull
    @DecimalMin("0")
    private BigDecimal rentPrice;

    @NotNull(message = "Status is required")
    private RoomStatus status;

    @Size(max = 1000)
    private String contractUrl;

    private Integer paymentDay;

    /** Giá điện cố định đ/tháng (khi dùng option giá cứng). */
    @DecimalMin("0")
    private BigDecimal fixedElecAmount;

    /** Giá nước cố định đ/tháng (khi dùng option giá cứng). */
    @DecimalMin("0")
    private BigDecimal fixedWaterAmount;

    /** Chỉ số điện khởi điểm (chỉ set khi chuyển trạng thái sang Cho thuê và nhập chỉ số đồng hồ). */
    @DecimalMin("0")
    private BigDecimal initialElecReading;

    /** Chỉ số nước khởi điểm (chỉ set khi chuyển trạng thái sang Cho thuê và nhập chỉ số đồng hồ). */
    @DecimalMin("0")
    private BigDecimal initialWaterReading;
}
