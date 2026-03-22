package com.management.exception;

/**
 * Base type for domain "resource not found" errors — handled uniformly as HTTP 404 by
 * {@link com.management.exception.advice.DomainExceptionAdvice}.
 */
public abstract class ResourceNotFoundException extends RuntimeException {

    protected ResourceNotFoundException(String message) {
        super(message);
    }
}
