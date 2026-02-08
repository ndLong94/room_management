package com.management.controller;

import com.management.dto.request.UpdateFeedbackRequest;
import com.management.dto.response.FeedbackResponse;
import com.management.service.FeedbackService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/feedback")
@RequiredArgsConstructor
@Tag(name = "Admin - Feedback", description = "Admin: update feedback status (approve/reject)")
public class AdminFeedbackController {

    private final FeedbackService feedbackService;

    @PutMapping("/{feedbackId}")
    @Operation(summary = "Update feedback (status, content, admin note) (admin only)")
    public ResponseEntity<FeedbackResponse> updateFeedback(
            @PathVariable Long feedbackId,
            @Valid @RequestBody UpdateFeedbackRequest request) {
        return ResponseEntity.ok(feedbackService.updateFeedback(feedbackId, request));
    }
}
