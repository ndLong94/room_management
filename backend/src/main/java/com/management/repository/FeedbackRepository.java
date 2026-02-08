package com.management.repository;

import com.management.domain.entity.Feedback;
import com.management.domain.enums.FeedbackStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface FeedbackRepository extends JpaRepository<Feedback, Long> {

    List<Feedback> findByUserIdOrderByCreatedAtDesc(Long userId);

    long countByUserIdAndStatus(Long userId, FeedbackStatus status);

    @Query("SELECT f FROM Feedback f WHERE (:status IS NULL OR f.status = :status) AND (:userId IS NULL OR f.userId = :userId) ORDER BY f.createdAt DESC")
    List<Feedback> findAllForAdmin(@Param("status") FeedbackStatus status, @Param("userId") Long userId);
}
