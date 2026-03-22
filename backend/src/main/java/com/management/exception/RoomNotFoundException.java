package com.management.exception;

public class RoomNotFoundException extends ResourceNotFoundException {

    public RoomNotFoundException(String message) {
        super(message);
    }
}
