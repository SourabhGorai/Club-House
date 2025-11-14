package com.profile.profile_management_service.exception;
class ProfileValidationException extends RuntimeException {

    public ProfileValidationException(String message) {
        super(message);
    }

    public ProfileValidationException(String message, Throwable cause) {
        super(message, cause);
    }
}