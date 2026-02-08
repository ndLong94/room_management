package com.management.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminUserDetailResponse {

    private UserResponse user;
    private int roomCount;
    private BigDecimal platformPriceAmount;
    private String platformPriceNote;
    private Instant platformPriceUpdatedAt;
    private List<UserPlatformPaymentResponse> payments;
    private List<FeedbackResponse> feedbacks;
}
