package com.clubHouse.tnp.exception;

import org.springframework.web.reactive.function.client.WebClientResponseException;

public class ExternalServiceException extends RuntimeException {
    public ExternalServiceException(String message) {
        super(message);
    }

    public ExternalServiceException(String message, Throwable cause) {
        super(message, cause);
    }

    public ExternalServiceException(String userService, String format, Exception e) {
    }
}