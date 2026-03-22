package com.management.exception;

public class InvoiceNotFoundException extends ResourceNotFoundException {

    public InvoiceNotFoundException(String message) {
        super(message);
    }
}
