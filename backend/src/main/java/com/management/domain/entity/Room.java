package com.management.domain.entity;

import com.management.domain.enums.RoomStatus;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "rooms")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Room {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "property_id", nullable = false, updatable = false)
    private Long propertyId;

    @Column(nullable = false, length = 255)
    private String name;

    @Column(name = "rent_price", nullable = false, precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal rentPrice = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private RoomStatus status = RoomStatus.VACANT;

    @Column(name = "contract_url", length = 1000)
    private String contractUrl;

    @Column(name = "payment_day")
    private Integer paymentDay;

    @Column(name = "deposit_amount", precision = 15, scale = 2)
    private BigDecimal depositAmount;

    @Column(name = "deposit_date")
    private LocalDate depositDate;

    @Column(name = "deposit_paid")
    @Builder.Default
    private Boolean depositPaid = false;

    /** Giá điện cố định (đ/tháng). Nếu set thì hóa đơn dùng số này thay vì tính từ đồng hồ. */
    @Column(name = "fixed_elec_amount", precision = 12, scale = 2)
    private BigDecimal fixedElecAmount;

    /** Giá nước cố định (đ/tháng). Nếu set thì hóa đơn dùng số này thay vì tính từ đồng hồ. */
    @Column(name = "fixed_water_amount", precision = 12, scale = 2)
    private BigDecimal fixedWaterAmount;

    /** Chỉ số điện khởi điểm (khi bắt đầu cho thuê). Tháng đầu dùng làm chỉ số “tháng trước” để tính tiêu thụ. */
    @Column(name = "initial_elec_reading", precision = 12, scale = 2)
    private BigDecimal initialElecReading;

    /** Chỉ số nước khởi điểm (khi bắt đầu cho thuê). Tháng đầu dùng làm chỉ số “tháng trước” để tính tiêu thụ. */
    @Column(name = "initial_water_reading", precision = 12, scale = 2)
    private BigDecimal initialWaterReading;

    @Column(name = "invoice_recipient_occupant_id")
    private Long invoiceRecipientOccupantId;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    protected void onCreate() {
        if (this.createdAt == null) {
            this.createdAt = Instant.now();
        }
        if (this.status == null) {
            this.status = RoomStatus.VACANT;
        }
    }
}
