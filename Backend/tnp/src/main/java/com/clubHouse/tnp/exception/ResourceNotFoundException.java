package com.clubHouse.tnp.exception;

import org.springframework.http.HttpStatus;

public class ResourceNotFoundException extends TnpBaseException {

    public ResourceNotFoundException(String message) {
        super(message, HttpStatus.NOT_FOUND, "TNP_NOT_FOUND");
    }
}