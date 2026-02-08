package com.management.service;

import com.management.domain.entity.User;
import com.management.domain.entity.UserPlatformPayment;
import com.management.domain.entity.UserPlatformPrice;
import com.management.domain.enums.UserStatus;
import com.management.dto.request.CreateUserRequest;
import com.management.dto.request.RecordPlatformPaymentRequest;
import com.management.dto.request.SetPlatformPriceRequest;
import com.management.dto.request.SetUserStatusRequest;
import com.management.dto.response.AdminUserDetailResponse;
import com.management.dto.response.AdminUserListItemResponse;
import com.management.dto.response.FeedbackResponse;
import com.management.dto.response.UserPlatformPaymentResponse;
import com.management.dto.response.UserResponse;
import com.management.exception.AuthException;
import com.management.repository.RoomRepository;
import com.management.service.FeedbackService;
import com.management.repository.UserPlatformPaymentRepository;
import com.management.repository.UserPlatformPriceRepository;
import com.management.repository.UserRepository;
import com.management.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminUserService {

    private final UserRepository userRepository;
    private final UserPlatformPriceRepository platformPriceRepository;
    private final UserPlatformPaymentRepository platformPaymentRepository;
    private final RoomRepository roomRepository;
    private final PasswordEncoder passwordEncoder;
    private final FeedbackService feedbackService;

    private static void ensureAdmin() {
        UserPrincipal principal = (UserPrincipal) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal.getUser().getRole() != com.management.domain.enums.UserRole.ADMIN) {
            throw new AuthException("Chỉ admin mới được thực hiện thao tác này");
        }
    }

    /** Username of the system admin account (admin@local) – excluded from user management list. */
    private static final String SYSTEM_ADMIN_USERNAME = "admin";

    public Page<AdminUserListItemResponse> listUsers(Pageable pageable, UserStatus statusFilter) {
        ensureAdmin();
        Page<User> users = userRepository.findAllExcludingUsernameOrderByCreatedAtDesc(
                SYSTEM_ADMIN_USERNAME, statusFilter, pageable);
        return users.map(this::toListItem);
    }

    public AdminUserDetailResponse getUserDetail(Long userId) {
        ensureAdmin();
        User user = userRepository.findById(userId).orElseThrow(() -> new AuthException("User not found"));
        int roomCount = (int) roomRepository.countByOwnerUserId(userId);
        UserPlatformPrice price = platformPriceRepository.findByUserId(userId).orElse(null);
        BigDecimal amount = price != null ? price.getAmount() : BigDecimal.ZERO;
        String note = price != null ? price.getNote() : null;
        Instant priceUpdatedAt = price != null ? price.getUpdatedAt() : null;
        List<UserPlatformPayment> payments = platformPaymentRepository.findByUserIdOrderByPaidAtDesc(userId);
        List<UserPlatformPaymentResponse> paymentResponses = payments.stream()
                .map(p -> UserPlatformPaymentResponse.builder()
                        .id(p.getId())
                        .userId(p.getUserId())
                        .amount(p.getAmount())
                        .paidAt(p.getPaidAt())
                        .note(p.getNote())
                        .createdAt(p.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
        Instant lastPaymentAt = payments.isEmpty() ? null : payments.get(0).getPaidAt();
        List<FeedbackResponse> feedbacks = feedbackService.listByUserId(userId);
        return AdminUserDetailResponse.builder()
                .user(toUserResponse(user))
                .roomCount(roomCount)
                .platformPriceAmount(amount)
                .platformPriceNote(note)
                .platformPriceUpdatedAt(priceUpdatedAt)
                .payments(paymentResponses)
                .feedbacks(feedbacks)
                .build();
    }

    @Transactional
    public UserResponse createUser(CreateUserRequest request) {
        ensureAdmin();
        if (userRepository.existsByUsername(request.getUsername().trim())) {
            throw new AuthException("Username already taken");
        }
        if (userRepository.existsByEmail(request.getEmail().trim().toLowerCase())) {
            throw new AuthException("Email already registered");
        }
        User user = User.builder()
                .username(request.getUsername().trim())
                .email(request.getEmail().trim().toLowerCase())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(com.management.domain.enums.UserRole.USER)
                .status(UserStatus.ACTIVE)
                .build();
        user = userRepository.save(user);
        return toUserResponse(user);
    }

    @Transactional
    public void approve(Long userId) {
        ensureAdmin();
        User user = userRepository.findById(userId).orElseThrow(() -> new AuthException("User not found"));
        user.setStatus(UserStatus.ACTIVE);
        userRepository.save(user);
    }

    @Transactional
    public void setStatus(Long userId, SetUserStatusRequest request) {
        ensureAdmin();
        if (request.getStatus() == UserStatus.DRAFT) {
            throw new AuthException("Cannot set status to DRAFT");
        }
        User user = userRepository.findById(userId).orElseThrow(() -> new AuthException("User not found"));
        if (user.getRole() == com.management.domain.enums.UserRole.ADMIN) {
            throw new AuthException("Cannot change status of admin user");
        }
        user.setStatus(request.getStatus());
        userRepository.save(user);
    }

    @Transactional
    public void setPlatformPrice(Long userId, SetPlatformPriceRequest request) {
        ensureAdmin();
        if (!userRepository.existsById(userId)) {
            throw new AuthException("User not found");
        }
        UserPlatformPrice price = platformPriceRepository.findByUserId(userId)
                .orElse(UserPlatformPrice.builder().userId(userId).amount(BigDecimal.ZERO).build());
        price.setAmount(request.getAmount());
        price.setNote(request.getNote());
        platformPriceRepository.save(price);
    }

    @Transactional
    public UserPlatformPaymentResponse recordPayment(Long userId, RecordPlatformPaymentRequest request) {
        ensureAdmin();
        if (!userRepository.existsById(userId)) {
            throw new AuthException("User not found");
        }
        Instant paidAt = request.getPaidAt() != null ? request.getPaidAt() : Instant.now();
        UserPlatformPayment payment = UserPlatformPayment.builder()
                .userId(userId)
                .amount(request.getAmount())
                .paidAt(paidAt)
                .note(request.getNote())
                .build();
        payment = platformPaymentRepository.save(payment);
        return UserPlatformPaymentResponse.builder()
                .id(payment.getId())
                .userId(payment.getUserId())
                .amount(payment.getAmount())
                .paidAt(payment.getPaidAt())
                .note(payment.getNote())
                .createdAt(payment.getCreatedAt())
                .build();
    }

    private AdminUserListItemResponse toListItem(User user) {
        long userId = user.getId();
        int roomCount = (int) roomRepository.countByOwnerUserId(userId);
        BigDecimal platformPriceAmount = platformPriceRepository.findByUserId(userId)
                .map(UserPlatformPrice::getAmount).orElse(BigDecimal.ZERO);
        Instant lastPaymentAt = platformPaymentRepository.findByUserIdOrderByPaidAtDesc(userId).stream()
                .findFirst()
                .map(UserPlatformPayment::getPaidAt)
                .orElse(null);
        return AdminUserListItemResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole())
                .status(user.getStatus() != null ? user.getStatus() : UserStatus.DRAFT)
                .createdAt(user.getCreatedAt())
                .roomCount(roomCount)
                .platformPriceAmount(platformPriceAmount)
                .lastPaymentAt(lastPaymentAt)
                .build();
    }

    private static UserResponse toUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole())
                .status(user.getStatus())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
