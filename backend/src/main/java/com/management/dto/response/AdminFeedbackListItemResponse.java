package com.management.dto.response;

import com.management.domain.enums.FeedbackStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminFeedbackListItemResponse {

    private Long id;
    private Long userId;
    private String username;
    private String content;
    private FeedbackStatus status;
    private String adminNote;
    private List<FeedbackConversationMessage> conversation;
    private Instant createdAt;
    private Instant updatedAt;
}
