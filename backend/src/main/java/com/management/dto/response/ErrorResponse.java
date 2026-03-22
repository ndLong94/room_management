package com.management.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Value;

import java.time.Instant;
import java.util.List;

@Value
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ErrorResponse {

    String requestId;
    Instant timestamp;
    int status;
    String error;
    String message;
    String path;
    List<FieldError> fieldErrors;

    @Value
    public static class FieldError {
        String field;
        String message;
        Object rejectedValue;
    }
}
