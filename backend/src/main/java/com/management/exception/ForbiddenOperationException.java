package com.management.exception;

/**
 * Operation not allowed for the current principal (HTTP 403).
 */
public class ForbiddenOperationException extends RuntimeException {

    public ForbiddenOperationException(String message) {
        super(message);
    }
}
