package com.clubHouse.tnp.exception;

import org.springframework.http.HttpStatus;

public class InvalidRequestException extends TnpBaseException {

    public InvalidRequestException(String message) {
        super(message, HttpStatus.BAD_REQUEST, "TNP_INVALID_REQUEST");
    }
}