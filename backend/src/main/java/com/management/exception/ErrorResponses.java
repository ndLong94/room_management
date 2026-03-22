package com.management.exception;

import com.management.dto.response.ErrorResponse;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.MDC;
import org.springframework.http.HttpStatus;

import java.time.Instant;
import java.util.List;

import static com.management.config.RequestIdFilter.MDC_REQUEST_ID;
import static com.management.config.RequestIdFilter.REQUEST_ID_HEADER;
import static com.management.dto.response.ErrorResponse.FieldError;

/**
 * Builds {@link ErrorResponse} bodies for API errors (request id from MDC or header).
 */
public final class ErrorResponses {

    private ErrorResponses() {}

    public static ErrorResponse of(HttpServletRequest request, HttpStatus status,
                                   String error, String message, List<FieldError> fieldErrors) {
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
