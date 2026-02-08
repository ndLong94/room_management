package com.management.controller;

import com.management.domain.enums.FeedbackStatus;
import com.management.dto.request.FeedbackReplyRequest;
import com.management.dto.request.UpdateFeedbackRequest;
import com.management.dto.response.AdminFeedbackListItemResponse;
import com.management.dto.response.FeedbackResponse;
import com.management.service.FeedbackService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/feedback")
@RequiredArgsConstructor
@Tag(name = "Admin - Feedback", description = "Admin: list feedback (filter by status, user), update status")
public class AdminFeedbackController {

    private final FeedbackService feedbackService;

    @GetMapping
    @Operation(summary = "List all feedback with optional filter by status and userId, order by createdAt desc (admin only)")
    public ResponseEntity<List<AdminFeedbackListItemResponse>> list(
            @RequestParam(required = false) FeedbackStatus status,
            @RequestParam(required = false) Long userId) {
        return ResponseEntity.ok(feedbackService.listAllForAdmin(status, userId));
    }

    @PutMapping("/{feedbackId}")
    @Operation(summary = "Update feedback (status, content, admin note) (admin only). Status can be PENDING, APPROVED, REJECTED, RESOLVED.")
    public ResponseEntity<FeedbackResponse> updateFeedback(
            @PathVariable Long feedbackId,
            @Valid @RequestBody UpdateFeedbackRequest request) {
        return ResponseEntity.ok(feedbackService.updateFeedback(feedbackId, request));
    }

    @PostMapping("/{feedbackId}/reply")
    @Operation(summary = "Admin replies to feedback conversation")
    public ResponseEntity<FeedbackResponse> reply(
            @PathVariable Long feedbackId,
            @Valid @RequestBody FeedbackReplyRequest request) {
        return ResponseEntity.ok(feedbackService.addReplyByAdmin(feedbackId, request.getContent()));
    }
}
