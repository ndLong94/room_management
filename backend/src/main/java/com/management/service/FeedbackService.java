package com.management.service;

import com.management.domain.entity.Feedback;
import com.management.domain.enums.FeedbackStatus;
import com.management.dto.request.CreateFeedbackRequest;
import com.management.dto.request.UpdateFeedbackRequest;
import com.management.dto.response.FeedbackResponse;
import com.management.exception.AuthException;
import com.management.repository.FeedbackRepository;
import com.management.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FeedbackService {

    private final FeedbackRepository feedbackRepository;

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

    private FeedbackResponse toResponse(Feedback f) {
        return FeedbackResponse.builder()
                .id(f.getId())
                .userId(f.getUserId())
                .content(f.getContent())
                .status(f.getStatus())
                .adminNote(f.getAdminNote())
                .createdAt(f.getCreatedAt())
                .updatedAt(f.getUpdatedAt())
                .build();
    }
}
