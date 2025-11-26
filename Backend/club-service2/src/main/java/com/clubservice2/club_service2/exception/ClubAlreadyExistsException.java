package com.clubservice2.club_service2.exception;

public class ClubAlreadyExistsException extends ClubServiceException {
    public ClubAlreadyExistsException(String clubName) {
        super(String.format("Club already exists: '%s'", clubName));
    }
}