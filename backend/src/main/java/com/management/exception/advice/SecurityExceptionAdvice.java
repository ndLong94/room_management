package com.management.exception.advice;

import com.management.dto.response.ErrorResponse;
import com.management.exception.AuthException;
import com.management.exception.ErrorResponses;
import io.jsonwebtoken.ExpiredJwtException;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * Authentication and authorization failures (Spring Security, JWT).
 */
@Slf4j
@RestControllerAdvice
@Order(20)
public class SecurityExceptionAdvice {

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ErrorResponse> handleBadCredentials(BadCredentialsException ex,
                                                              HttpServletRequest request) {
        ErrorResponse body = ErrorResponses.of(request, HttpStatus.UNAUTHORIZED, "Unauthorized",
                "Tên đăng nhập hoặc mật khẩu không đúng.", null);
        log.debug("Bad credentials: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(body);
    }

    @ExceptionHandler(AuthException.class)
    public ResponseEntity<ErrorResponse> handleAuthException(AuthException ex, HttpServletRequest request) {
        ErrorResponse body = ErrorResponses.of(request, HttpStatus.BAD_REQUEST, "Lỗi xác thực", ex.getMessage(), null);
        log.debug("Auth error: {}", ex.getMessage());
        return ResponseEntity.badRequest().body(body);
    }

    @ExceptionHandler(ExpiredJwtException.class)
    public ResponseEntity<ErrorResponse> handleExpiredJwt(ExpiredJwtException ex, HttpServletRequest request) {
        ErrorResponse body = ErrorResponses.of(request, HttpStatus.UNAUTHORIZED, "Phiên đăng nhập hết hạn",
                "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.", null);
        log.debug("Expired JWT: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(body);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDenied(AccessDeniedException ex,
                                                            HttpServletRequest request) {
        ErrorResponse body = ErrorResponses.of(request, HttpStatus.FORBIDDEN, "Từ chối truy cập",
                "Bạn không có quyền thực hiện thao tác này.", null);
        log.warn("Access denied: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(body);
    }
}
