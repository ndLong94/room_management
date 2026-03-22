package com.management.exception;

public class OccupantNotFoundException extends ResourceNotFoundException {

    public OccupantNotFoundException(String message) {
        super(message);
    }
}
