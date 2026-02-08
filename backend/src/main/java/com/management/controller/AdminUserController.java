package com.management.controller;

import com.management.dto.request.CreateUserRequest;
import com.management.dto.request.RecordPlatformPaymentRequest;
import com.management.dto.request.SetPlatformPriceRequest;
import com.management.dto.request.SetUserStatusRequest;
import com.management.dto.response.AdminUserDetailResponse;
import com.management.dto.response.AdminUserListItemResponse;
import com.management.dto.response.UserPlatformPaymentResponse;
import com.management.dto.response.UserResponse;
import com.management.domain.enums.UserStatus;
import com.management.dto.response.FeedbackResponse;
import com.management.service.AdminUserService;
import com.management.service.FeedbackService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
@Tag(name = "Admin - Users", description = "Admin: list users, set platform price, payment history")
public class AdminUserController {

    private final AdminUserService adminUserService;
    private final FeedbackService feedbackService;

    @GetMapping
    @Operation(summary = "List users with paging, filter by status, order by createdAt desc (admin only)")
    public ResponseEntity<Page<AdminUserListItemResponse>> listUsers(
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable,
            @RequestParam(required = false) UserStatus status) {
        return ResponseEntity.ok(adminUserService.listUsers(pageable, status));
    }

    @PostMapping
    @Operation(summary = "Create user with initial password (admin only)")
    public ResponseEntity<UserResponse> createUser(@Valid @RequestBody CreateUserRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(adminUserService.createUser(request));
    }

    @PostMapping("/{userId}/approve")
    @Operation(summary = "Approve user (DRAFT -> ACTIVE) (admin only)")
    public ResponseEntity<Void> approve(@PathVariable Long userId) {
        adminUserService.approve(userId);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{userId}/status")
    @Operation(summary = "Set user status ACTIVE/INACTIVE (admin only)")
    public ResponseEntity<Void> setStatus(@PathVariable Long userId,
                                          @Valid @RequestBody SetUserStatusRequest request) {
        adminUserService.setStatus(userId, request);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{userId}")
    @Operation(summary = "Get user detail with platform price and payment history (admin only)")
    public ResponseEntity<AdminUserDetailResponse> getUserDetail(@PathVariable Long userId) {
        return ResponseEntity.ok(adminUserService.getUserDetail(userId));
    }

    @PutMapping("/{userId}/platform-price")
    @Operation(summary = "Set platform price for user (admin only)")
    public ResponseEntity<Void> setPlatformPrice(@PathVariable Long userId,
                                                 @Valid @RequestBody SetPlatformPriceRequest request) {
        adminUserService.setPlatformPrice(userId, request);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{userId}/platform-payments")
    @Operation(summary = "Record a platform payment for user (admin only)")
    public ResponseEntity<UserPlatformPaymentResponse> recordPayment(@PathVariable Long userId,
                                                                     @Valid @RequestBody RecordPlatformPaymentRequest request) {
        return ResponseEntity.ok(adminUserService.recordPayment(userId, request));
    }

    @GetMapping("/{userId}/feedback")
    @Operation(summary = "List feedbacks of a user (admin only)")
    public ResponseEntity<List<FeedbackResponse>> listUserFeedback(@PathVariable Long userId) {
        return ResponseEntity.ok(feedbackService.listByUserId(userId));
    }
}
