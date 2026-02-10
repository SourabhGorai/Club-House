package com.clubservice2.club_service2.repository;

import com.clubservice2.club_service2.model.UserClub;
import org.antlr.v4.runtime.atn.SemanticContext;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserClubRepository extends JpaRepository<UserClub, Long> {

    List<UserClub> findByPrn(String prn);

    @Query("SELECT uc FROM UserClub uc JOIN FETCH uc.club WHERE uc.club.clubName = :clubName AND uc.club.isActive = true")
    List<UserClub> findByClubName(@Param("clubName") String clubName);

    @Query("SELECT uc FROM UserClub uc JOIN FETCH uc.club WHERE uc.prn = :prn AND uc.club.clubName = :clubName")
    Optional<UserClub> findByPrnAndClubName(@Param("prn") String prn, @Param("clubName") String clubName);

    boolean existsByPrnAndClubClubIdAndRoleAndTenure(String prn, Long clubId, String role, String tenure);

    // Add this method
    long countByClub_ClubId(Long clubId);

    // Add these methods to fetch Teacher and Admin
    @Query("SELECT uc FROM UserClub uc WHERE uc.club.clubId = :clubId AND uc.role = :role")
    List<UserClub> findByClubIdAndRole(@Param("clubId") Long clubId, @Param("role") String role);

    void deleteByClub_ClubId(Long clubId);

    long deleteByPrn(String prn);

    boolean existsByPrn(String prn);

    List<UserClub> findByRole(String role);

    UserClub findByPrnAndClub_Id(String prn, Long clubId);
}