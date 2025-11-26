package com.clubservice2.club_service2.exception;

public class ClubServiceException extends RuntimeException {
    public ClubServiceException(String message) {
        super(message);
    }

    public ClubServiceException(String message, Throwable cause) {
        super(message, cause);
    }
}