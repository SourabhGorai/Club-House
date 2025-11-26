package com.clubservice2.club_service2.exception;

public class UserNotFoundException extends ClubServiceException {
    public UserNotFoundException(String prn) {
        super(String.format("User not found with PRN: '%s'", prn));
    }
}
