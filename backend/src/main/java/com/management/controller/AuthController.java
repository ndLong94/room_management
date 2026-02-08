package com.management.controller;

import com.management.dto.request.FacebookLoginRequest;
import com.management.dto.request.GoogleLoginRequest;
import com.management.dto.request.LoginRequest;
import com.management.dto.request.RegisterRequest;
import com.management.dto.request.UpdateProfileRequest;
import com.management.dto.response.AuthResponse;
import com.management.dto.response.UserResponse;
import com.management.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Auth", description = "Registration, login, and current user")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    @Operation(summary = "Register a new user")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/login")
    @Operation(summary = "Login and get JWT")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/google")
    @Operation(summary = "Login or register with Google (send ID token credential)")
    public ResponseEntity<AuthResponse> loginWithGoogle(@Valid @RequestBody GoogleLoginRequest request) {
        return ResponseEntity.ok(authService.loginWithGoogle(request));
    }

    @PostMapping("/facebook")
    @Operation(summary = "Login or register with Facebook (send access token)")
    public ResponseEntity<AuthResponse> loginWithFacebook(@Valid @RequestBody FacebookLoginRequest request) {
        return ResponseEntity.ok(authService.loginWithFacebook(request));
    }

    @GetMapping("/me")
    @Operation(summary = "Get current user (requires Bearer token)")
    public ResponseEntity<UserResponse> me() {
        return ResponseEntity.ok(authService.me());
    }

    @PutMapping("/me")
    @Operation(summary = "Update profile (email only; username cannot be changed)")
    public ResponseEntity<UserResponse> updateProfile(@Valid @RequestBody UpdateProfileRequest request) {
        return ResponseEntity.ok(authService.updateProfile(request));
    }
}
