package com.clubservice.club_service.exception;

public class ClubOperationException extends RuntimeException {
    public ClubOperationException(String message, Throwable cause) {
        super(message, cause);
    }
}
