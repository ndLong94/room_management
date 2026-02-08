package com.management.dto.response;

import com.management.domain.enums.UserRole;
import com.management.domain.enums.UserStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminUserListItemResponse {

    private Long id;
    private String username;
    private String email;
    private UserRole role;
    private UserStatus status;
    private Instant createdAt;
    private int roomCount;
    private BigDecimal platformPriceAmount;
    private Instant lastPaymentAt;
}
