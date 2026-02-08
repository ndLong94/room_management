package com.management.repository;

import com.management.domain.entity.Feedback;
import com.management.domain.enums.FeedbackStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FeedbackRepository extends JpaRepository<Feedback, Long> {

    List<Feedback> findByUserIdOrderByCreatedAtDesc(Long userId);

    long countByUserIdAndStatus(Long userId, FeedbackStatus status);
}
