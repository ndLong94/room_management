package com.management.exception.advice;

import com.management.dto.response.ErrorResponse;
import com.management.exception.ErrorResponses;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.resource.NoResourceFoundException;

/**
 * Static resources / unknown routes and catch-all; ordered last so specific handlers win first.
 */
@Slf4j
@RestControllerAdvice
@Order(Ordered.LOWEST_PRECEDENCE)
public class FallbackExceptionAdvice {

    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(NoResourceFoundException ex,
                                                        HttpServletRequest request) {
        ErrorResponse body = ErrorResponses.of(request, HttpStatus.NOT_FOUND, "Không tìm thấy",
                "Không tìm thấy tài nguyên.", null);
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(body);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ErrorResponse> handleUnreadableJson(HttpMessageNotReadableException ex,
                                                              HttpServletRequest request) {
        ErrorResponse body = ErrorResponses.of(request, HttpStatus.BAD_REQUEST, "Bad Request",
                "Dữ liệu JSON không hợp lệ hoặc thiếu.", null);
        log.debug("Unreadable HTTP message: {}", ex.getMessage());
        return ResponseEntity.badRequest().body(body);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneric(Exception ex, HttpServletRequest request) {
        log.error("Unhandled exception", ex);
        ErrorResponse body = ErrorResponses.of(request, HttpStatus.INTERNAL_SERVER_ERROR,
                "Lỗi máy chủ", "Đã xảy ra lỗi. Vui lòng thử lại sau.", null);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(body);
    }
}
