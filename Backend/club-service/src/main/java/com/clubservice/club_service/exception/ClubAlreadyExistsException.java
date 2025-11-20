package com.clubservice.club_service.exception;

public class ClubAlreadyExistsException extends RuntimeException {
    public ClubAlreadyExistsException(String message) {
        super(message);
    }
}
