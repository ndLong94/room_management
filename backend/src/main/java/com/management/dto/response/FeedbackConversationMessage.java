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
public class FeedbackConversationMessage {

    public static final String ROLE_ADMIN = "admin";
    public static final String ROLE_USER = "user";

    private String role;   // "admin" | "user"
    private Long userId;
    private String content;
    private Instant createdAt;
}
