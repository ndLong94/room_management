package com.management.exception.advice;

import com.management.dto.response.ErrorResponse;
import com.management.exception.ErrorResponses;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindException;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.List;
import java.util.stream.Collectors;

import static com.management.dto.response.ErrorResponse.FieldError;

/**
 * Bean validation and binding errors ({@code @Valid}, form {@link BindException}).
 */
@Slf4j
@RestControllerAdvice
@Order(Ordered.HIGHEST_PRECEDENCE)
public class ValidationExceptionAdvice {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleMethodArgumentNotValid(MethodArgumentNotValidException ex,
                                                                      HttpServletRequest request) {
        return validationFailed(ex.getBindingResult(), request);
    }

    @ExceptionHandler(BindException.class)
    public ResponseEntity<ErrorResponse> handleBind(BindException ex, HttpServletRequest request) {
        return validationFailed(ex.getBindingResult(), request);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ErrorResponse> handleConstraintViolation(ConstraintViolationException ex,
                                                                   HttpServletRequest request) {
        List<FieldError> errors = ex.getConstraintViolations().stream()
                .map(this::mapConstraintViolation)
                .collect(Collectors.toList());
        ErrorResponse body = ErrorResponses.of(request, HttpStatus.BAD_REQUEST, "Lỗi xác thực",
                "Một hoặc nhiều tham số không hợp lệ.", errors);
        log.warn("Constraint violation: {}", errors);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
    }

    private FieldError mapConstraintViolation(ConstraintViolation<?> v) {
        return new FieldError(
                v.getPropertyPath().toString(),
                v.getMessage() != null ? v.getMessage() : "Giá trị không hợp lệ",
                v.getInvalidValue());
    }

    private ResponseEntity<ErrorResponse> validationFailed(BindingResult bindingResult, HttpServletRequest request) {
        List<FieldError> errors = mapFieldErrors(bindingResult);
        ErrorResponse body = ErrorResponses.of(request, HttpStatus.BAD_REQUEST, "Lỗi xác thực",
                "Một hoặc nhiều trường không hợp lệ.", errors);
        log.warn("Validation failed: {}", errors);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
    }

    private static List<FieldError> mapFieldErrors(BindingResult bindingResult) {
        return bindingResult.getFieldErrors().stream()
                .map(fe -> new FieldError(
                        fe.getField(),
                        fe.getDefaultMessage() != null ? fe.getDefaultMessage() : "Giá trị không hợp lệ",
                        fe.getRejectedValue()))
                .collect(Collectors.toList());
    }
}
