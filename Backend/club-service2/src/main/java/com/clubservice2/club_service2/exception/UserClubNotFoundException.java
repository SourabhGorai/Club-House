package com.clubservice2.club_service2.exception;

public class UserClubNotFoundException extends ClubServiceException {
    public UserClubNotFoundException(String prn, String clubName) {
        super(String.format("User-club association not found for PRN: '%s' and club: '%s'", prn, clubName));
    }
}
