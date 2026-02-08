package com.management.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateOccupantRequest {

    @NotBlank(message = "Full name is required")
    @Size(max = 255)
    private String fullName;

    @Size(max = 50)
    private String phone;

    @Size(max = 50)
    private String idNumber;

    @Size(max = 50)
    private String idType;

    @Size(max = 500)
    private String address;

    private LocalDate dob;

    @Size(max = 1000)
    private String avatarUrl;

    @Size(max = 1000)
    private String idFrontUrl;

    @Size(max = 1000)
    private String idBackUrl;

    @Size(max = 1000)
    private String tempResidenceUrl;

    private String note;

    @Size(max = 100)
    private String zaloUserId;
}
