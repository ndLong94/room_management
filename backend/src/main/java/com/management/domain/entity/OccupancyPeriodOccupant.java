package com.management.domain.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "occupancy_period_occupants")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OccupancyPeriodOccupant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "period_id", nullable = false, updatable = false)
    private Long periodId;

    @Column(name = "full_name", nullable = false, length = 255)
    private String fullName;

    @Column(length = 50)
    private String phone;

    @Column(name = "id_number", length = 50)
    private String idNumber;

    @Column(name = "id_type", length = 50)
    private String idType;

    @Column(length = 500)
    private String address;

    @Column(name = "dob")
    private LocalDate dob;

    @Column(name = "avatar_url", length = 1000)
    private String avatarUrl;

    @Column(name = "id_front_url", length = 1000)
    private String idFrontUrl;

    @Column(name = "id_back_url", length = 1000)
    private String idBackUrl;

    @Column(name = "temp_residence_url", length = 1000)
    private String tempResidenceUrl;

    @Column(columnDefinition = "TEXT")
    private String note;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    protected void onCreate() {
        if (this.createdAt == null) {
            this.createdAt = Instant.now();
        }
    }
}
