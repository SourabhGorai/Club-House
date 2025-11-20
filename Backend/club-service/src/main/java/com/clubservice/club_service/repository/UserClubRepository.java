package com.clubservice.club_service.repository;

import com.clubservice.club_service.model.UserClub;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserClubRepository extends JpaRepository<UserClub, Long> {
    List<UserClub> findByPrn(String prn);
    List<UserClub> findByClub_ClubName(String clubName); // club.clubName
    Optional<UserClub> findByPrnAndClub_ClubName(String prn, String clubName);

}
