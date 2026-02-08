package com.management.dto.request;

import com.management.domain.enums.FeedbackStatus;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateFeedbackRequest {

    @Size(max = 2000)
    private String content;

    private FeedbackStatus status;

    @Size(max = 1000)
    private String adminNote;
}
