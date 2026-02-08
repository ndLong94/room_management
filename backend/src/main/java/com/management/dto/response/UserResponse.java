package com.management.dto.response;

import com.management.domain.enums.UserRole;
import com.management.domain.enums.UserStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {

    private Long id;
    private String username;
    private String email;
    private UserRole role;
    private UserStatus status;
    private Instant createdAt;
}
