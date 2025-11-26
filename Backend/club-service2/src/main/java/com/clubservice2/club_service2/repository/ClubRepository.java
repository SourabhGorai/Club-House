package com.clubservice2.club_service2.repository;

import com.clubservice2.club_service2.model.Club;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ClubRepository extends JpaRepository<Club, Long> {

    boolean existsByClubNameAndIsActiveTrue(String clubName);

    boolean existsByClubNameAndIsActiveFalse(String clubName);

    Optional<Club> findByClubNameAndIsActiveTrue(String clubName);

    Optional<Club> findByClubNameAndIsActiveFalse(String clubName);

    @Query("SELECT c FROM Club c WHERE c.isActive = true ORDER BY c.clubName")
    List<Club> findAllActiveClubs();
}