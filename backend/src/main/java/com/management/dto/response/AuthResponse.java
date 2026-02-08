package com.management.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {

    @JsonProperty("access_token")
    private String accessToken;

    @JsonProperty("token_type")
    private String tokenType;

    private UserResponse user;

    public static AuthResponse of(String accessToken, UserResponse user) {
        return AuthResponse.builder()
                .accessToken(accessToken)
                .tokenType("Bearer")
                .user(user)
                .build();
    }

    /** After register: no token, user must wait for admin approval */
    public static AuthResponse registered(UserResponse user) {
        return AuthResponse.builder()
                .accessToken(null)
                .tokenType("Bearer")
                .user(user)
                .build();
    }
}
