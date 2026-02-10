package com.management.exception;

import com.management.dto.response.ErrorResponse;
import io.jsonwebtoken.ExpiredJwtException;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.MDC;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.BindException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

import static com.management.config.RequestIdFilter.MDC_REQUEST_ID;
import static com.management.config.RequestIdFilter.REQUEST_ID_HEADER;
import static com.management.dto.response.ErrorResponse.FieldErrorDto;

@RestControllerAdvice
@Slf4j
@RequiredArgsConstructor
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException ex,
                                                          HttpServletRequest request) {
        List<FieldErrorDto> errors = ex.getBindingResult().getFieldErrors().stream()
                .map(fe -> new FieldErrorDto(
                        fe.getField(),
                        fe.getDefaultMessage() != null ? fe.getDefaultMessage() : "Giá trị không hợp lệ",
                        fe.getRejectedValue()))
                .collect(Collectors.toList());
        ErrorResponse body = buildError(request, HttpStatus.BAD_REQUEST, "Lỗi xác thực",
                "Một hoặc nhiều trường không hợp lệ.", errors);
        log.warn("Validation failed: {}", errors);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
    }

    @ExceptionHandler(BindException.class)
    public ResponseEntity<ErrorResponse> handleBind(BindException ex, HttpServletRequest request) {
        List<FieldErrorDto> errors = ex.getBindingResult().getFieldErrors().stream()
                .map(fe -> new FieldErrorDto(
                        fe.getField(),
                        fe.getDefaultMessage() != null ? fe.getDefaultMessage() : "Giá trị không hợp lệ",
                        fe.getRejectedValue()))
                .collect(Collectors.toList());
        ErrorResponse body = buildError(request, HttpStatus.BAD_REQUEST, "Lỗi xác thực",
                "Một hoặc nhiều trường không hợp lệ.", errors);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ErrorResponse> handleBadCredentials(BadCredentialsException ex,
                                                              HttpServletRequest request) {
        ErrorResponse body = buildError(request, HttpStatus.UNAUTHORIZED, "Unauthorized",
                "Tên đăng nhập hoặc mật khẩu không đúng.", null);
        log.debug("Bad credentials: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(body);
    }

    @ExceptionHandler(AuthException.class)
    public ResponseEntity<ErrorResponse> handleAuthException(AuthException ex, HttpServletRequest request) {
        ErrorResponse body = buildError(request, HttpStatus.BAD_REQUEST, "Lỗi xác thực", ex.getMessage(), null);
        log.warn("Auth error: {}", ex.getMessage());
        return ResponseEntity.badRequest().body(body);
    }

    @ExceptionHandler(ExpiredJwtException.class)
    public ResponseEntity<ErrorResponse> handleExpiredJwt(ExpiredJwtException ex, HttpServletRequest request) {
        ErrorResponse body = buildError(request, HttpStatus.UNAUTHORIZED, "Phiên đăng nhập hết hạn",
                "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.", null);
        log.debug("Expired JWT: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(body);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDenied(AccessDeniedException ex,
                                                            HttpServletRequest request) {
        ErrorResponse body = buildError(request, HttpStatus.FORBIDDEN, "Từ chối truy cập",
                "Bạn không có quyền thực hiện thao tác này.", null);
        log.warn("Access denied: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(body);
    }

    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(NoResourceFoundException ex,
                                                        HttpServletRequest request) {
        ErrorResponse body = buildError(request, HttpStatus.NOT_FOUND, "Không tìm thấy",
                "Không tìm thấy tài nguyên.", null);
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(body);
    }

    @ExceptionHandler(PropertyNotFoundException.class)
    public ResponseEntity<ErrorResponse> handlePropertyNotFound(PropertyNotFoundException ex,
                                                              HttpServletRequest request) {
        ErrorResponse body = buildError(request, HttpStatus.NOT_FOUND, "Not Found", ex.getMessage(), null);
        log.debug("Property not found: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(body);
    }

    @ExceptionHandler(RoomNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleRoomNotFound(RoomNotFoundException ex,
                                                            HttpServletRequest request) {
        ErrorResponse body = buildError(request, HttpStatus.NOT_FOUND, "Not Found", ex.getMessage(), null);
        log.debug("Room not found: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(body);
    }

    @ExceptionHandler(InvoiceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleInvoiceNotFound(InvoiceNotFoundException ex,
                                                              HttpServletRequest request) {
        ErrorResponse body = buildError(request, HttpStatus.NOT_FOUND, "Not Found", ex.getMessage(), null);
        log.debug("Invoice not found: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(body);
    }

    @ExceptionHandler(InvoiceAlreadyPaidException.class)
    public ResponseEntity<ErrorResponse> handleInvoiceAlreadyPaid(InvoiceAlreadyPaidException ex,
                                                                  HttpServletRequest request) {
        ErrorResponse body = buildError(request, HttpStatus.CONFLICT, "Conflict", ex.getMessage(), null);
        log.debug("Invoice already paid: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.CONFLICT).body(body);
    }

    @ExceptionHandler(OccupantNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleOccupantNotFound(OccupantNotFoundException ex,
                                                               HttpServletRequest request) {
        ErrorResponse body = buildError(request, HttpStatus.NOT_FOUND, "Not Found", ex.getMessage(), null);
        log.debug("Occupant not found: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(body);
    }

    @ExceptionHandler(TenantNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleTenantNotFound(TenantNotFoundException ex,
                                                               HttpServletRequest request) {
        ErrorResponse body = buildError(request, HttpStatus.NOT_FOUND, "Not Found", ex.getMessage(), null);
        log.debug("Tenant not found: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(body);
    }

    @ExceptionHandler(RoomLeaseNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleRoomLeaseNotFound(RoomLeaseNotFoundException ex,
                                                                 HttpServletRequest request) {
        ErrorResponse body = buildError(request, HttpStatus.NOT_FOUND, "Not Found", ex.getMessage(), null);
        log.debug("Room lease not found: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(body);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> handleIllegalArgument(IllegalArgumentException ex,
                                                               HttpServletRequest request) {
        ErrorResponse body = buildError(request, HttpStatus.BAD_REQUEST, "Bad Request",
                ex.getMessage(), null);
        log.warn("Bad request: {}", ex.getMessage());
        return ResponseEntity.badRequest().body(body);
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<ErrorResponse> handleIllegalState(IllegalStateException ex,
                                                          HttpServletRequest request) {
        ErrorResponse body = buildError(request, HttpStatus.BAD_REQUEST, "Bad Request",
                ex.getMessage(), null);
        log.warn("Invalid state: {}", ex.getMessage());
        return ResponseEntity.badRequest().body(body);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneric(Exception ex, HttpServletRequest request) {
        log.error("Unhandled exception", ex);
        ErrorResponse body = buildError(request, HttpStatus.INTERNAL_SERVER_ERROR,
                "Lỗi máy chủ", "Đã xảy ra lỗi. Vui lòng thử lại sau.", null);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(body);
    }

    private static ErrorResponse buildError(HttpServletRequest request, HttpStatus status,
                                            String error, String message, List<FieldErrorDto> fieldErrors) {
        String requestId = MDC.get(MDC_REQUEST_ID);
        if (requestId == null) {
            requestId = request.getHeader(REQUEST_ID_HEADER);
        }
        return ErrorResponse.builder()
                .requestId(requestId)
                .timestamp(Instant.now())
                .status(status.value())
                .error(error)
                .message(message)
                .path(request.getRequestURI())
                .fieldErrors(fieldErrors)
                .build();
    }
}
