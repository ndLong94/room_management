package com.management.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OccupancyPeriodOccupantResponse {

    private Long id;
    private Long periodId;
    private String fullName;
    private String phone;
    private String idNumber;
    private String idType;
    private String address;
    private LocalDate dob;
    private String avatarUrl;
    private String idFrontUrl;
    private String idBackUrl;
    private String tempResidenceUrl;
    private String note;
    private Instant createdAt;
}
