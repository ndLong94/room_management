package com.management.exception;

public class RoomLeaseNotFoundException extends ResourceNotFoundException {

    public RoomLeaseNotFoundException(String message) {
        super(message);
    }
}
