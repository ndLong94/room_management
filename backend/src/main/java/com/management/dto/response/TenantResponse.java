package com.management.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TenantResponse {

    private Long id;
    private Long ownerUserId;
    private String fullName;
    private String phone;
    private String idNumber;
    private String idType;
    private String address;
    private Instant createdAt;
}
