package com.management.service;

import com.management.domain.entity.User;
import com.management.domain.enums.UserStatus;
import com.management.dto.request.FacebookLoginRequest;
import com.management.dto.request.GoogleLoginRequest;
import com.management.dto.request.LoginRequest;
import com.management.dto.request.RegisterRequest;
import com.management.dto.request.UpdateProfileRequest;
import com.management.dto.response.AuthResponse;
import com.management.dto.response.UserResponse;
import com.management.exception.AuthException;
import com.management.repository.UserRepository;
import com.management.security.JwtUtil;
import com.management.security.UserPrincipal;
import com.management.service.OAuthVerificationService.OAuthUserInfo;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final OAuthVerificationService oAuthVerificationService;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String username = request.getUsername().trim().toLowerCase();
        String email = request.getEmail().trim().toLowerCase();
        if (userRepository.existsByUsernameIgnoreCase(username)) {
            throw new AuthException("Tên đăng nhập đã tồn tại.");
        }
        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new AuthException("Email đã được đăng ký.");
        }
        User user = User.builder()
                .username(username)
                .email(email)
                .password(passwordEncoder.encode(request.getPassword()))
                .status(UserStatus.DRAFT)
                .build();
        user = userRepository.save(user);
        return AuthResponse.registered(toUserResponse(user));
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByUsernameIgnoreCase(request.getUsername().trim())
                .orElseThrow(() -> new BadCredentialsException("Invalid username or password"));
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BadCredentialsException("Invalid username or password");
        }
        if (user.getStatus() != UserStatus.ACTIVE) {
            if (user.getStatus() == UserStatus.DRAFT) {
                throw new AuthException("Tài khoản chưa được duyệt. Vui lòng chờ admin phê duyệt.");
            }
            throw new AuthException("Tài khoản đã bị vô hiệu hóa.");
        }
        String token = jwtUtil.generateToken(user.getUsername());
        return AuthResponse.of(token, toUserResponse(user));
    }

    public AuthResponse loginWithGoogle(GoogleLoginRequest request) {
        OAuthUserInfo info = oAuthVerificationService.verifyGoogleToken(request.getCredential());
        return findOrCreateOAuthUser(info.email(), info.name());
    }

    public AuthResponse loginWithFacebook(FacebookLoginRequest request) {
        OAuthUserInfo info = oAuthVerificationService.verifyFacebookToken(request.getAccessToken());
        return findOrCreateOAuthUser(info.email(), info.name());
    }

    private AuthResponse findOrCreateOAuthUser(String email, String name) {
        String emailLower = email != null ? email.trim().toLowerCase() : "";
        User user = userRepository.findByEmailIgnoreCase(emailLower).orElse(null);
        if (user != null) {
            if (user.getStatus() != UserStatus.ACTIVE) {
                if (user.getStatus() == UserStatus.DRAFT) {
                    throw new AuthException("Tài khoản chưa được duyệt. Vui lòng chờ admin phê duyệt.");
                }
                throw new AuthException("Tài khoản đã bị vô hiệu hóa.");
            }
        } else {
            String username = emailLower;
            int at = emailLower.indexOf('@');
            if (at > 0) {
                username = emailLower.substring(0, at).replaceAll("[^a-zA-Z0-9]", "_").toLowerCase();
            }
            if (userRepository.existsByUsernameIgnoreCase(username)) {
                username = username + "_" + UUID.randomUUID().toString().substring(0, 8);
            }
            user = User.builder()
                    .username(username)
                    .email(emailLower)
                    .password(passwordEncoder.encode(UUID.randomUUID().toString()))
                    .status(UserStatus.ACTIVE)
                    .build();
            user = userRepository.save(user);
        }
        String token = jwtUtil.generateToken(user.getUsername());
        return AuthResponse.of(token, toUserResponse(user));
    }

    public UserResponse me() {
        UserPrincipal principal = (UserPrincipal) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return toUserResponse(principal.getUser());
    }

    @Transactional
    public UserResponse updateProfile(UpdateProfileRequest request) {
        UserPrincipal principal = (UserPrincipal) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User user = userRepository.findById(principal.getUser().getId())
                .orElseThrow(() -> new AuthException("User not found"));
        String newEmail = request.getEmail().trim().toLowerCase();
        if (userRepository.existsByEmailIgnoreCaseAndIdNot(newEmail, user.getId())) {
            throw new AuthException("Email đã được sử dụng bởi tài khoản khác");
        }
        user.setEmail(newEmail);
        user = userRepository.save(user);
        return toUserResponse(user);
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
