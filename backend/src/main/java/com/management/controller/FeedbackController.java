package com.management.controller;

import com.management.dto.request.CreateFeedbackRequest;
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
}
