package com.clubHouse.tnp.exception;

import org.springframework.http.HttpStatus;

public class UnauthorizedException extends TnpBaseException {

    public UnauthorizedException(String message) {
        super(message, HttpStatus.FORBIDDEN, "TNP_ACCESS_DENIED");
    }
}