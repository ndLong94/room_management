package com.management.exception;

public class OccupantNotFoundException extends RuntimeException {

    public OccupantNotFoundException(String message) {
        super(message);
    }
}
