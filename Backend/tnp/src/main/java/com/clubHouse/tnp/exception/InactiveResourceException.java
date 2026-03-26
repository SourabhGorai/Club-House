package com.clubHouse.tnp.exception;

import org.springframework.http.HttpStatus;

public class InactiveResourceException extends TnpBaseException {

    public InactiveResourceException(String message) {
        super(message, HttpStatus.GONE, "TNP_RESOURCE_INACTIVE");
    }
}