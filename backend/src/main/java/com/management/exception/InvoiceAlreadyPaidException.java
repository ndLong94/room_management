package com.management.exception;

public class InvoiceAlreadyPaidException extends RuntimeException {

    public InvoiceAlreadyPaidException(String message) {
        super(message);
    }
}
