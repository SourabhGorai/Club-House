package com.profile.profile_management_service.exception;


public class ProfileOperationException extends RuntimeException {

    public ProfileOperationException(String message) {
        super(message);
    }

    public ProfileOperationException(String message, Throwable cause) {
        super(message, cause);
    }
}
