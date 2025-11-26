package com.clubservice2.club_service2.exception;

public class ClubNotFoundException extends ClubServiceException {
    public ClubNotFoundException(String clubName) {
        super(String.format("Club not found: '%s'", clubName));
    }
}
