package com.clubservice2.club_service2.service;

import com.clubservice2.club_service2.dto.AdminResponse;
import com.clubservice2.club_service2.dto.ClubRequest;
import com.clubservice2.club_service2.dto.ClubResponse;
import com.clubservice2.club_service2.dto.ClubSummaryResponse;
import com.clubservice2.club_service2.exception.ClubAlreadyExistsException;
import com.clubservice2.club_service2.exception.ClubNotFoundException;
import com.clubservice2.club_service2.exception.ClubServiceException;
import com.clubservice2.club_service2.mapper.ClubMapper;
import com.clubservice2.club_service2.model.Club;
import com.clubservice2.club_service2.model.UserClub;
import com.clubservice2.club_service2.repository.ClubRepository;
import com.clubservice2.club_service2.repository.UserClubRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ClubService {

    private final ClubRepository clubRepository;
    private final UserClubRepository userClubRepository;

    /**
     * Creates a new club or reactivates a deleted club
     */
//    @Transactional
//    public ClubResponse createClub(String clubName) {
//        log.info("Creating club with name: {}", clubName);
//
//        String sanitizedName = ClubMapper.sanitizeClubName(clubName);
//
//        if (sanitizedName == null || sanitizedName.isEmpty()) {
//            throw new ClubServiceException("Invalid club name provided");
//        }
//
//        // Check if active club exists
//        if (clubRepository.existsByClubNameAndIsActiveTrue(sanitizedName)) {
//            log.warn("Attempt to create club that already exists: {}", sanitizedName);
//            throw new ClubAlreadyExistsException(sanitizedName);
//        }
//
//        // Check if deleted club exists - reactivate it
//        if (clubRepository.existsByClubNameAndIsActiveFalse(sanitizedName)) {
//            log.info("Reactivating previously deleted club: {}", sanitizedName);
//            Club club = clubRepository.findByClubNameAndIsActiveFalse(sanitizedName)
//                    .orElseThrow(() -> new ClubNotFoundException(sanitizedName));
//
//            club.setIsActive(true);
//            club.setCreatedAt(LocalDateTime.now());
//            club.setDeletedAt(null);
//
//            Club reactivated = clubRepository.save(club);
//            log.info("Successfully reactivated club: {}", sanitizedName);
//            return ClubMapper.toResponse(reactivated);
//        }
//
//        // Create new club
//        Club club = Club.builder()
//                .clubName(sanitizedName)
//                .isActive(true)
//                .build();
//
//        try {
//            Club savedClub = clubRepository.save(club);
//            log.info("Successfully created new club: {}", sanitizedName);
//            return ClubMapper.toResponse(savedClub);
//        } catch (Exception e) {
//            log.error("Failed to create club: {}", sanitizedName, e);
//            throw new ClubServiceException("Failed to create club: " + sanitizedName, e);
//        }
//    }

    @Transactional
    public ClubResponse createClub(ClubRequest request) {
        String clubName = request.getName();
        String clubDesc = request.getClubDesc();

        log.info("Creating club with name: {} \nDesc: {}", clubName, clubDesc);

        String sanitizedName = ClubMapper.sanitizeClubName(clubName);

        if (sanitizedName == null || sanitizedName.isEmpty()) {
            throw new ClubServiceException("Invalid club name provided");
        }

        // Check if active club exists
        if (clubRepository.existsByClubNameAndIsActiveTrue(sanitizedName)) {
            log.warn("Attempt to create club that already exists: {}", sanitizedName);
            throw new ClubAlreadyExistsException(sanitizedName);
        }

        // Check if deleted club exists - reactivate it
        if (clubRepository.existsByClubNameAndIsActiveFalse(sanitizedName)) {
            log.info("Reactivating previously deleted club: {}", sanitizedName);
            Club club = clubRepository.findByClubNameAndIsActiveFalse(sanitizedName)
                    .orElseThrow(() -> new ClubNotFoundException(sanitizedName));

            club.setClubDesc(clubDesc);
            club.setIsActive(true);
            club.setCreatedAt(LocalDateTime.now());
            club.setDeletedAt(null);

            Club reactivated = clubRepository.save(club);
            log.info("Successfully reactivated club: {}", sanitizedName);
            return ClubMapper.toResponse(reactivated);
        }

        // Create new club
        Club club = Club.builder()
                .clubName(sanitizedName)
                .clubDesc(clubDesc)
                .isActive(true)
                .build();

        try {
            Club savedClub = clubRepository.save(club);
            log.info("Successfully created new club: {}", sanitizedName);
            return ClubMapper.toResponse(savedClub);
        } catch (Exception e) {
            log.error("Failed to create club: {}", sanitizedName, e);
            throw new ClubServiceException("Failed to create club: " + sanitizedName, e);
        }
    }

    /**
     * Soft deletes a club by marking it as inactive
     */
    @Transactional
    public void deleteClub(String clubName) {
        log.info("Deleting club: {}", clubName);

        String sanitizedName = ClubMapper.sanitizeClubName(clubName);

        Club club = clubRepository.findByClubNameAndIsActiveTrue(sanitizedName)
                .orElseThrow(() -> {
                    log.error("Club not found for deletion: {}", sanitizedName);
                    return new ClubNotFoundException(sanitizedName);
                });

        try {
            club.setIsActive(false);
            club.setDeletedAt(LocalDateTime.now());
            clubRepository.save(club);
            log.info("Successfully deleted club: {}", sanitizedName);
        } catch (Exception e) {
            log.error("Failed to delete club: {}", sanitizedName, e);
            throw new ClubServiceException("Failed to delete club: " + sanitizedName, e);
        }
    }

    /**
     * Retrieves all clubs (including inactive)
     */
    @Transactional(readOnly = true)
    public List<ClubResponse> getAllClubs() {
        log.debug("Fetching all clubs");
        List<Club> clubs = clubRepository.findAll();
        log.info("Found {} clubs", clubs.size());
        return ClubMapper.toResponseList(clubs);
    }

    /**
     * Retrieves only active clubs
     */
    @Transactional(readOnly = true)
    public List<ClubResponse> getActiveClubs() {
        log.debug("Fetching active clubs");
        List<Club> clubs = clubRepository.findAllActiveClubs();
        log.info("Found {} active clubs", clubs.size());
        return ClubMapper.toResponseList(clubs);
    }

    /**
     * Retrieves public club summaries (only active clubs)
     */
    @Transactional(readOnly = true)
    public List<ClubSummaryResponse> getPublicClubSummaries() {
        log.debug("Fetching public club summaries");
        List<Club> clubs = clubRepository.findAllActiveClubs();
        log.info("Found {} active clubs for public view", clubs.size());
        return ClubMapper.toSummaryResponseList(clubs);
    }

    /**
     * Retrieves a single club by name
     */
    @Transactional(readOnly = true)
    public ClubResponse getClubByName(String clubName) {
        log.debug("Fetching club by name: {}", clubName);

        String sanitizedName = ClubMapper.sanitizeClubName(clubName);
        Club club = clubRepository.findByClubNameAndIsActiveTrue(sanitizedName)
                .orElseThrow(() -> new ClubNotFoundException(sanitizedName));

        return ClubMapper.toResponse(club);
    }

    /**
     * Retrieves admin dashboard data for a specific club
     */
    @Transactional(readOnly = true)
    public AdminResponse getAdminResponse(Long clubId) {
        log.debug("Fetching data for the admin request for clubId: {}", clubId);

        Club club = clubRepository.findById(clubId)
                .orElseThrow(() -> new ClubNotFoundException("Club not found with id: " + clubId));

        // Get total member count for this club
        long totalCount = userClubRepository.countByClub_ClubId(clubId);

        // Get Teacher/Faculty (assuming role = "TEACHER" or "FACULTY")
        List<UserClub> teachers = userClubRepository.findByClubIdAndRole(clubId, "TEACHER");
        if (teachers.isEmpty()) {
            teachers = userClubRepository.findByClubIdAndRole(clubId, "FACULTY");
        }
        String teacherName = teachers.isEmpty() ? "Not Assigned" : teachers.get(0).getPrn();

        // Get Club Admin (role = "CLUB_ADMIN")
        List<UserClub> admins = userClubRepository.findByClubIdAndRole(clubId, "CLUB_ADMIN");
        String adminName;

        if (admins.isEmpty()) {
            adminName = "Not Assigned";
        } else if (admins.size() == 1) {
            adminName = admins.get(0).getPrn();
        } else {
            // Multiple admins - join their PRNs with comma
            adminName = admins.stream()
                    .map(UserClub::getPrn)
                    .distinct()
                    .reduce((a, b) -> a + ", " + b)
                    .orElse("Not Assigned");
        }

        AdminResponse resp = AdminResponse.builder()
                .clubName(club.getClubName())
                .clubDesc(club.getClubDesc())
                .Teacher(teacherName)
                .clubAdmin(adminName)
                .totalCount(totalCount)
                .build();

        log.info("Successfully fetched admin response for club: {} with {} members",
                club.getClubName(), totalCount);
        return resp;
    }
}