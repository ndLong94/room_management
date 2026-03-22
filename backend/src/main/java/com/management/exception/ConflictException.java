package com.management.exception;

/**
 * Business rule conflict such as duplicate resource (HTTP 409).
 */
public class ConflictException extends RuntimeException {

    public ConflictException(String message) {
        super(message);
    }
}
