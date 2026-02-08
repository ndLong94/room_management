package com.management.repository;

import com.management.domain.entity.User;
import com.management.domain.enums.UserStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByUsername(String username);

    Optional<User> findByEmail(String email);

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);

    List<User> findAllByOrderByCreatedAtDesc();

    @Query("SELECT u FROM User u WHERE u.username <> :exclude AND (:status IS NULL OR u.status = :status)")
    Page<User> findAllExcludingUsernameOrderByCreatedAtDesc(
            @Param("exclude") String excludeUsername,
            @Param("status") UserStatus status,
            Pageable pageable);
}
