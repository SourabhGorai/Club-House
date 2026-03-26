package com.clubHouse.tnp.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public abstract class TnpBaseException extends RuntimeException {

    private final HttpStatus status;
    private final String errorCode;

    protected TnpBaseException(String message, HttpStatus status, String errorCode) {
        super(message);
        this.status = status;
        this.errorCode = errorCode;
    }
}