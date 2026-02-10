package com.management.exception;

public class RoomLeaseNotFoundException extends RuntimeException {

    public RoomLeaseNotFoundException(String message) {
        super(message);
    }
}
