package com.clubservice.club_service.repository;

import com.clubservice.club_service.model.ClubCreation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ClubRepository extends JpaRepository<ClubCreation, Long> {
    boolean existsByClubNameAndIsActiveTrue(String clubName);
    boolean existsByClubNameAndIsActiveFalse(String clubName);
    ClubCreation findByClubNameAndIsActiveFalse(String clubName);
    Optional<ClubCreation> findByClubNameAndIsActiveTrue(String clubName);
}
