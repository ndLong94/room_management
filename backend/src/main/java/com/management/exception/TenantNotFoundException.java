package com.management.exception;

public class TenantNotFoundException extends ResourceNotFoundException {

    public TenantNotFoundException(String message) {
        super(message);
    }
}
