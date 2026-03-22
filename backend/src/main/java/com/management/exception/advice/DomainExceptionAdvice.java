package com.management.exception.advice;

import com.management.dto.response.ErrorResponse;
import com.management.exception.ErrorResponses;
import com.management.exception.ConflictException;
import com.management.exception.ForbiddenOperationException;
import com.management.exception.InvoiceAlreadyPaidException;
import com.management.exception.ResourceNotFoundException;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * Domain rules: not-found resources, conflicts, invalid arguments/state.
 */
@Slf4j
@RestControllerAdvice
@Order(30)
public class DomainExceptionAdvice {

    @ExceptionHandler(ForbiddenOperationException.class)
    public ResponseEntity<ErrorResponse> handleForbidden(ForbiddenOperationException ex,
                                                         HttpServletRequest request) {
        ErrorResponse body = ErrorResponses.of(request, HttpStatus.FORBIDDEN, "Forbidden",
                ex.getMessage(), null);
        log.debug("Forbidden: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(body);
    }

    @ExceptionHandler(ConflictException.class)
    public ResponseEntity<ErrorResponse> handleConflict(ConflictException ex, HttpServletRequest request) {
        ErrorResponse body = ErrorResponses.of(request, HttpStatus.CONFLICT, "Conflict", ex.getMessage(), null);
        log.debug("Conflict: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.CONFLICT).body(body);
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleResourceNotFound(ResourceNotFoundException ex,
                                                                 HttpServletRequest request) {
        ErrorResponse body = ErrorResponses.of(request, HttpStatus.NOT_FOUND, "Not Found", ex.getMessage(), null);
        log.debug("{}: {}", ex.getClass().getSimpleName(), ex.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(body);
    }

    @ExceptionHandler(InvoiceAlreadyPaidException.class)
    public ResponseEntity<ErrorResponse> handleInvoiceAlreadyPaid(InvoiceAlreadyPaidException ex,
                                                                  HttpServletRequest request) {
        ErrorResponse body = ErrorResponses.of(request, HttpStatus.CONFLICT, "Conflict", ex.getMessage(), null);
        log.debug("Invoice already paid: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.CONFLICT).body(body);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> handleIllegalArgument(IllegalArgumentException ex,
                                                               HttpServletRequest request) {
        ErrorResponse body = ErrorResponses.of(request, HttpStatus.BAD_REQUEST, "Bad Request",
                ex.getMessage(), null);
        log.warn("Bad request: {}", ex.getMessage());
        return ResponseEntity.badRequest().body(body);
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<ErrorResponse> handleIllegalState(IllegalStateException ex,
                                                            HttpServletRequest request) {
        ErrorResponse body = ErrorResponses.of(request, HttpStatus.BAD_REQUEST, "Bad Request",
                ex.getMessage(), null);
        log.warn("Invalid state: {}", ex.getMessage());
        return ResponseEntity.badRequest().body(body);
    }
}
