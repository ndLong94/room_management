package com.management.exception;

public class FeedbackNotFoundException extends ResourceNotFoundException {

    public FeedbackNotFoundException(String message) {
        super(message);
    }
}
