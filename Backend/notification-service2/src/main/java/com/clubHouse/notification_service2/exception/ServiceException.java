package com.clubHouse.notification_service2.exception;

public class ServiceException extends RuntimeException {
    public ServiceException(String message) {
        super(message);
    }

    public ServiceException(String message, Throwable cause){
        super(message, cause);
    }

}
