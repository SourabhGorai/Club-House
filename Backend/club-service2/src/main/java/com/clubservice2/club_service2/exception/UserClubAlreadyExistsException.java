package com.clubservice2.club_service2.exception;

public class UserClubAlreadyExistsException extends ClubServiceException {
    public UserClubAlreadyExistsException(String prn, String clubName, String role, String tenure) {
        super(String.format("User '%s' is already associated with club '%s' as '%s' for tenure '%s'",
                prn, clubName, role, tenure));
    }
}
