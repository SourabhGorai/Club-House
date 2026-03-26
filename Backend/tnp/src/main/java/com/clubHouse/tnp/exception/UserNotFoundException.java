package com.clubHouse.tnp.exception;

public class UserNotFoundException extends ServiceException {
    public UserNotFoundException(String prn) {
        super(String.format("User not found with PRN: '%s'", prn));
    }
}
