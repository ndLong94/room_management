package com.management.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.management.domain.entity.Feedback;
import com.management.domain.entity.User;
import com.management.domain.enums.FeedbackStatus;
import com.management.dto.request.CreateFeedbackRequest;
import com.management.dto.request.UpdateFeedbackRequest;
import com.management.dto.response.AdminFeedbackListItemResponse;
import com.management.dto.response.FeedbackConversationMessage;
import com.management.dto.response.FeedbackResponse;
import com.management.exception.AuthException;
import com.management.repository.FeedbackRepository;
import com.management.repository.UserRepository;
import com.management.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FeedbackService {

    private static final TypeReference<List<FeedbackConversationMessage>> CONVERSATION_TYPE = new TypeReference<>() {};

    private final FeedbackRepository feedbackRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;

    private static Long currentUserId() {
        UserPrincipal principal = (UserPrincipal) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return principal.getUser().getId();
    }

    private static void ensureAdmin() {
        UserPrincipal principal = (UserPrincipal) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal.getUser().getRole() != com.management.domain.enums.UserRole.ADMIN) {
            throw new AuthException("Chỉ admin mới được thực hiện thao tác này");
        }
    }

    private static final int MAX_PENDING_FEEDBACK_PER_USER = 2;

    @Transactional
    public FeedbackResponse create(CreateFeedbackRequest request) {
        Long userId = currentUserId();
        long pendingCount = feedbackRepository.countByUserIdAndStatus(userId, FeedbackStatus.PENDING);
        if (pendingCount >= MAX_PENDING_FEEDBACK_PER_USER) {
            throw new AuthException("Mỗi user chỉ được có tối đa 2 ý kiến đang chờ xử lý. Vui lòng chờ admin phản hồi hoặc hủy ý kiến cũ.");
        }
        Feedback feedback = Feedback.builder()
                .userId(userId)
                .content(request.getContent().trim())
                .status(FeedbackStatus.PENDING)
                .build();
        feedback = feedbackRepository.save(feedback);
        return toResponse(feedback);
    }

    public List<FeedbackResponse> listMy() {
        Long userId = currentUserId();
        return feedbackRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<FeedbackResponse> listByUserId(Long userId) {
        ensureAdmin();
        return feedbackRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    /** Admin: list all feedback with optional filter by status and userId, ordered by createdAt desc. */
    public List<AdminFeedbackListItemResponse> listAllForAdmin(FeedbackStatus status, Long userId) {
        ensureAdmin();
        List<Feedback> list = feedbackRepository.findAllForAdmin(status, userId);
        Set<Long> userIds = list.stream().map(Feedback::getUserId).collect(Collectors.toSet());
        Map<Long, String> usernameByUserId = userRepository.findAllById(userIds).stream()
                .collect(Collectors.toMap(User::getId, User::getUsername));
        return list.stream()
                .map(f -> AdminFeedbackListItemResponse.builder()
                        .id(f.getId())
                        .userId(f.getUserId())
                        .username(usernameByUserId.get(f.getUserId()))
                        .content(f.getContent())
                        .status(f.getStatus())
                        .adminNote(f.getAdminNote())
                        .conversation(parseConversation(f.getConversation()))
                        .createdAt(f.getCreatedAt())
                        .updatedAt(f.getUpdatedAt())
                        .build())
                .collect(Collectors.toList());
    }

    /** User adds a reply to feedback (not allowed when RESOLVED). */
    @Transactional
    public FeedbackResponse addReplyByUser(Long feedbackId, String content) {
        Long userId = currentUserId();
        Feedback feedback = feedbackRepository.findById(feedbackId)
                .orElseThrow(() -> new AuthException("Không tìm thấy ý kiến"));
        if (!feedback.getUserId().equals(userId)) {
            throw new AuthException("Chỉ được phản hồi ý kiến của chính bạn.");
        }
        if (feedback.getStatus() == FeedbackStatus.RESOLVED) {
            throw new AuthException("Ý kiến đã đóng, không thể thêm phản hồi.");
        }
        appendConversationMessage(feedback, FeedbackConversationMessage.ROLE_USER, userId, content.trim());
        feedback = feedbackRepository.save(feedback);
        return toResponse(feedback);
    }

    /** Admin adds a reply to feedback. */
    @Transactional
    public FeedbackResponse addReplyByAdmin(Long feedbackId, String content) {
        ensureAdmin();
        Long adminUserId = currentUserId();
        Feedback feedback = feedbackRepository.findById(feedbackId)
                .orElseThrow(() -> new AuthException("Không tìm thấy ý kiến"));
        appendConversationMessage(feedback, FeedbackConversationMessage.ROLE_ADMIN, adminUserId, content.trim());
        feedback = feedbackRepository.save(feedback);
        return toResponse(feedback);
    }

    private void appendConversationMessage(Feedback feedback, String role, Long userId, String content) {
        List<FeedbackConversationMessage> parsed = parseConversation(feedback.getConversation());
        // Luôn tạo ArrayList mới để tránh UnsupportedOperationException với immutable lists
        List<FeedbackConversationMessage> list = new ArrayList<>(parsed != null ? parsed : List.of());
        list.add(FeedbackConversationMessage.builder()
                .role(role)
                .userId(userId)
                .content(content)
                .createdAt(Instant.now())
                .build());
        try {
            feedback.setConversation(objectMapper.writeValueAsString(list));
        } catch (Exception e) {
            throw new RuntimeException("Lưu đoạn hội thoại thất bại", e);
        }
    }

    private List<FeedbackConversationMessage> parseConversation(String json) {
        if (json == null || json.isBlank()) return List.of();
        try {
            List<FeedbackConversationMessage> list = objectMapper.readValue(json, CONVERSATION_TYPE);
            return list != null ? list : List.of();
        } catch (Exception e) {
            return List.of();
        }
    }

    @Transactional
    public FeedbackResponse updateFeedback(Long feedbackId, UpdateFeedbackRequest request) {
        ensureAdmin();
        Feedback feedback = feedbackRepository.findById(feedbackId)
                .orElseThrow(() -> new AuthException("Không tìm thấy ý kiến"));
        if (request.getContent() != null && !request.getContent().isBlank()) {
            feedback.setContent(request.getContent().trim());
        }
        if (request.getStatus() != null) {
            feedback.setStatus(request.getStatus());
        }
        if (request.getAdminNote() != null) {
            feedback.setAdminNote(request.getAdminNote().trim().isEmpty() ? null : request.getAdminNote().trim());
        }
        feedback = feedbackRepository.save(feedback);
        return toResponse(feedback);
    }

    /** User updates own feedback; only allowed when status is PENDING. */
    @Transactional
    public FeedbackResponse updateMyFeedback(Long feedbackId, String content) {
        Long userId = currentUserId();
        Feedback feedback = feedbackRepository.findById(feedbackId)
                .orElseThrow(() -> new AuthException("Không tìm thấy ý kiến"));
        if (!feedback.getUserId().equals(userId)) {
            throw new AuthException("Chỉ được sửa ý kiến của chính bạn.");
        }
        if (feedback.getStatus() != FeedbackStatus.PENDING) {
            throw new AuthException("Chỉ được sửa ý kiến đang chờ xử lý.");
        }
        feedback.setContent(content.trim());
        feedback = feedbackRepository.save(feedback);
        return toResponse(feedback);
    }

    /** User deletes own feedback; only allowed when status is PENDING. */
    @Transactional
    public void deleteMyFeedback(Long feedbackId) {
        Long userId = currentUserId();
        Feedback feedback = feedbackRepository.findById(feedbackId)
                .orElseThrow(() -> new AuthException("Không tìm thấy ý kiến"));
        if (!feedback.getUserId().equals(userId)) {
            throw new AuthException("Chỉ được xóa ý kiến của chính bạn.");
        }
        if (feedback.getStatus() != FeedbackStatus.PENDING) {
            throw new AuthException("Chỉ được xóa ý kiến đang chờ xử lý.");
        }
        feedbackRepository.delete(feedback);
    }

    private FeedbackResponse toResponse(Feedback f) {
        return FeedbackResponse.builder()
                .id(f.getId())
                .userId(f.getUserId())
                .content(f.getContent())
                .status(f.getStatus())
                .adminNote(f.getAdminNote())
                .conversation(parseConversation(f.getConversation()))
                .createdAt(f.getCreatedAt())
                .updatedAt(f.getUpdatedAt())
                .build();
    }
}
