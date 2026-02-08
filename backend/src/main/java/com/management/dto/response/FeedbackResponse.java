package com.management.dto.response;

import com.management.domain.enums.FeedbackStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FeedbackResponse {

    private Long id;
    private Long userId;
    private String content;
    private FeedbackStatus status;
    private String adminNote;
    private Instant createdAt;
    private Instant updatedAt;
}
