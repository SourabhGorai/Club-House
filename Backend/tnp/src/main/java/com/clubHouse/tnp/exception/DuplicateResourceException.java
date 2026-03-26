package com.clubHouse.tnp.exception;

import org.springframework.http.HttpStatus;

public class DuplicateResourceException extends TnpBaseException {

    public DuplicateResourceException(String message) {
        super(message, HttpStatus.CONFLICT, "TNP_DUPLICATE_ENTRY");
    }
}