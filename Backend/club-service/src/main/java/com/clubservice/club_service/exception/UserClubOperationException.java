package com.clubservice.club_service.exception;

public class UserClubOperationException extends RuntimeException {
    public UserClubOperationException(String message, Throwable cause) {
        super(message, cause);
    }
}
