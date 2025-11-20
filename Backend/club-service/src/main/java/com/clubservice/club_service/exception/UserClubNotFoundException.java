package com.clubservice.club_service.exception;

public class UserClubNotFoundException extends RuntimeException {
    public UserClubNotFoundException(String message) {
        super(message);
    }
}
