package com.management.controller;

import com.management.dto.request.CreateFeedbackRequest;
import com.management.dto.request.FeedbackReplyRequest;
import com.management.dto.request.UpdateMyFeedbackRequest;
import com.management.dto.response.FeedbackResponse;
import com.management.service.FeedbackService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/feedback")
@RequiredArgsConstructor
@Tag(name = "Feedback", description = "User submit and list own feedback")
public class FeedbackController {

    private final FeedbackService feedbackService;

    @PostMapping
    @Operation(summary = "Submit feedback (current user)")
    public ResponseEntity<FeedbackResponse> create(@Valid @RequestBody CreateFeedbackRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(feedbackService.create(request));
    }

    @GetMapping
    @Operation(summary = "List my feedbacks")
    public ResponseEntity<List<FeedbackResponse>> listMine() {
        return ResponseEntity.ok(feedbackService.listMy());
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update my feedback (only when status is PENDING)")
    public ResponseEntity<FeedbackResponse> updateMine(
            @PathVariable Long id,
            @Valid @RequestBody UpdateMyFeedbackRequest request) {
        return ResponseEntity.ok(feedbackService.updateMyFeedback(id, request.getContent()));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete my feedback (only when status is PENDING)")
    public ResponseEntity<Void> deleteMine(@PathVariable Long id) {
        feedbackService.deleteMyFeedback(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/reply")
    @Operation(summary = "User replies to feedback conversation (not when RESOLVED)")
    public ResponseEntity<FeedbackResponse> reply(
            @PathVariable Long id,
            @Valid @RequestBody FeedbackReplyRequest request) {
        return ResponseEntity.ok(feedbackService.addReplyByUser(id, request.getContent()));
    }
}
