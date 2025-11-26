package com.clubservice2.club_service2.exception;

public class ExternalServiceException extends ClubServiceException {
    public ExternalServiceException(String serviceName, String message) {
        super(String.format("Error communicating with %s: %s", serviceName, message));
    }

    public ExternalServiceException(String serviceName, String message, Throwable cause) {
        super(String.format("Error communicating with %s: %s", serviceName, message), cause);
    }
}