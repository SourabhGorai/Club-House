package com.clubservice2.club_service2.service;

import com.clubservice2.club_service2.client.ProfileServiceClient;
import com.clubservice2.club_service2.client.UserServiceClient;
import com.clubservice2.club_service2.dto.*;
import com.clubservice2.club_service2.exception.ClubNotFoundException;
import com.clubservice2.club_service2.exception.ClubServiceException;
import com.clubservice2.club_service2.exception.UserClubAlreadyExistsException;
import com.clubservice2.club_service2.exception.UserClubNotFoundException;
import com.clubservice2.club_service2.mapper.ClubMapper;
import com.clubservice2.club_service2.mapper.UserClubMapper;
import com.clubservice2.club_service2.model.Club;
import com.clubservice2.club_service2.model.UserClub;
import com.clubservice2.club_service2.repository.ClubRepository;
import com.clubservice2.club_service2.repository.UserClubRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserClubService {

    private final UserClubRepository userClubRepository;
    private final ClubRepository clubRepository;
    private final UserServiceClient userServiceClient;
    private final ProfileServiceClient profileServiceClient;

    /**
     * Adds a user to a club with specified role and tenure
     */
    @Transactional
    public UserClubResponse addUserToClub(UserClubRequest request) {
        log.info("Adding user {} to club {}", request.getPrn(), request.getClubId());

        // Validate user exists
        userServiceClient.validateUser(request.getPrn());

        // Validate club exists
        Club club = clubRepository.findById(request.getClubId())
                .orElseThrow(() -> {
                    log.error("Club not found with ID: {}", request.getClubId());
                    return new ClubNotFoundException("Club with ID: " + request.getClubId());
                });

        // Check if this exact association already exists
        boolean exists = userClubRepository.existsByPrnAndClubClubIdAndRoleAndTenure(
                request.getPrn(),
                request.getClubId(),
                request.getRole(),
                request.getTenure()
        );

        if (exists) {
            log.warn("User-club association already exists: PRN={}, Club={}, Role={}, Tenure={}",
                    request.getPrn(), club.getClubName(), request.getRole(), request.getTenure());
            throw new UserClubAlreadyExistsException(
                    request.getPrn(),
                    club.getClubName(),
                    request.getRole(),
                    request.getTenure()
            );
        }

        // Create association
        UserClub userClub = UserClub.builder()
                .prn(request.getPrn())
                .club(club)
                .role(request.getRole())
                .tenure(request.getTenure())
                .build();

        try {
            UserClub saved = userClubRepository.save(userClub);
            log.info("Successfully added user {} to club {}", request.getPrn(), club.getClubName());
            return UserClubMapper.toResponse(saved);
        } catch (Exception e) {
            log.error("Failed to add user to club: PRN={}, ClubId={}",
                    request.getPrn(), request.getClubId(), e);
            throw new ClubServiceException("Failed to add user to club", e);
        }
    }

    /**
     * Retrieves all clubs for a specific user with profile enrichment
     */
    @Transactional(readOnly = true)
    public List<ProfileEnrichedUserClubResponse> getUserClubs(String prn) {
        log.debug("Fetching clubs for user: {}", prn);

        // Validate user exists
        userServiceClient.validateUser(prn);

        List<UserClub> userClubs = userClubRepository.findByPrn(prn);

        if (userClubs.isEmpty()) {
            log.info("No clubs found for user: {}", prn);
            return List.of();
        }

        log.info("Found {} clubs for user: {}, enriching with profile data", userClubs.size(), prn);

        // Fetch profile for the single PRN
        ProfileSummaryResponse profile = profileServiceClient.getProfileSummary(prn);
        System.out.println(profile);

        return userClubs.stream()
                .map(uc -> UserClubMapper.toProfileEnrichedResponse(uc, profile))
                .collect(Collectors.toList());
    }

    /**
     * Retrieves only club names for a specific user (lightweight)
     */
    @Transactional(readOnly = true)
    public List<String> getUserClubNames(String prn) {
        log.debug("Fetching club names for user: {}", prn);

        // Validate user exists
        userServiceClient.validateUser(prn);

        List<UserClub> userClubs = userClubRepository.findByPrn(prn);

        if (userClubs.isEmpty()) {
            log.info("No clubs found for user: {}", prn);
            return List.of();
        }

        return userClubs.stream()
                .map(uc -> uc.getClub().getClubName())
                .distinct()
                .collect(Collectors.toList());
    }

    /**
     * Retrieves all user-club associations with profile enrichment
     */
    @Transactional(readOnly = true)
    public List<ProfileEnrichedUserClubResponse> getAllUserClubAssociations() {
        log.debug("Fetching all user-club associations");

        List<UserClub> associations = userClubRepository.findAll();

        if (associations.isEmpty()) {
            log.info("No user-club associations found");
            return List.of();
        }

        log.info("Found {} user-club associations, enriching with profiles", associations.size());

        // Extract unique PRNs
        List<String> prns = associations.stream()
                .map(UserClub::getPrn)
                .distinct()
                .collect(Collectors.toList());

        // Fetch all profiles in bulk
        Map<String, ProfileSummaryResponse> profileMap =
                profileServiceClient.getProfileSummariesBulk(prns);

        // Map with profile enrichment
        return UserClubMapper.toProfileEnrichedResponseList(associations, profileMap);
    }

    /**
     * Retrieves all members of a specific club with profile enrichment
     */
    @Transactional(readOnly = true)
    public List<ProfileEnrichedUserClubResponse> getClubMembers(String clubName) {
        log.debug("Fetching members of club: {}", clubName);

        String sanitizedName = ClubMapper.sanitizeClubName(clubName);

        // Verify club exists
        clubRepository.findByClubNameAndIsActiveTrue(sanitizedName)
                .orElseThrow(() -> new ClubNotFoundException(sanitizedName));

        List<UserClub> members = userClubRepository.findByClubName(sanitizedName);

        if (members.isEmpty()) {
            log.info("No members found for club: {}", sanitizedName);
            return List.of();
        }

        log.info("Found {} members for club: {}, enriching with profiles",
                members.size(), sanitizedName);

        // Extract unique PRNs
        List<String> prns = members.stream()
                .map(UserClub::getPrn)
                .distinct()
                .collect(Collectors.toList());

        // Fetch all profiles in bulk
        Map<String, ProfileSummaryResponse> profileMap =
                profileServiceClient.getProfileSummariesBulk(prns);

        // Map with profile enrichment
        return UserClubMapper.toProfileEnrichedResponseList(members, profileMap);
    }

    /**
     * Removes a user from a club
     */
    @Transactional
    public void removeUserFromClub(String prn, String clubName) {
        log.info("Removing user {} from club {}", prn, clubName);

        // Validate user exists
        userServiceClient.validateUser(prn);

        String sanitizedName = ClubMapper.sanitizeClubName(clubName);

        UserClub userClub = userClubRepository.findByPrnAndClubName(prn, sanitizedName)
                .orElseThrow(() -> {
                    log.error("User-club association not found: PRN={}, Club={}", prn, sanitizedName);
                    return new UserClubNotFoundException(prn, sanitizedName);
                });

        try {
            userClubRepository.delete(userClub);
            log.info("Successfully removed user {} from club {}", prn, sanitizedName);
        } catch (Exception e) {
            log.error("Failed to remove user from club: PRN={}, Club={}", prn, sanitizedName, e);
            throw new ClubServiceException("Failed to remove user from club", e);
        }
    }

    /**
     * Retrieves all PRNs associated with a club
     */
    @Transactional(readOnly = true)
    public ClubPrnsResponse getClubPrns(String clubName) {
        log.debug("Fetching PRNs for club: {}", clubName);

        String sanitizedName = ClubMapper.sanitizeClubName(clubName);

        Club club = clubRepository.findByClubNameAndIsActiveTrue(sanitizedName)
                .orElseThrow(() -> new ClubNotFoundException(sanitizedName));

        List<UserClub> members = userClubRepository.findByClubName(sanitizedName);

        List<String> prns = members.stream()
                .map(UserClub::getPrn)
                .distinct()
                .collect(Collectors.toList());

        log.info("Found {} unique PRNs for club: {}", prns.size(), sanitizedName);

        return ClubPrnsResponse.builder()
                .clubId(club.getClubId())
                .clubName(club.getClubName())
                .totalCount(prns.size())
                .prns(prns)
                .build();
    }

    /**
     * Retrieves PRNs of club members filtered by academic year with profile enrichment
     */
    @Transactional(readOnly = true)
    public List<ProfileEnrichedUserClubResponse> getClubMembersByYear(String clubName, Integer year) {
        log.info("Fetching club members for club {} filtered by year {}", clubName, year);

        String sanitizedName = ClubMapper.sanitizeClubName(clubName);

        // Verify club exists
        Club club = clubRepository.findByClubNameAndIsActiveTrue(sanitizedName)
                .orElseThrow(() -> new ClubNotFoundException(sanitizedName));

        // Get all members
        List<UserClub> allMembers = userClubRepository.findByClubName(sanitizedName);

        if (allMembers.isEmpty()) {
            log.info("No members found for club: {}", sanitizedName);
            return List.of();
        }

        // Extract all PRNs
        List<String> allPrns = allMembers.stream()
                .map(UserClub::getPrn)
                .distinct()
                .collect(Collectors.toList());

        // Filter PRNs by year using profile service
        List<String> filteredPrns = profileServiceClient.filterPrnsByYear(allPrns, year);

        if (filteredPrns.isEmpty()) {
            log.info("No members found for club {} in year {}", sanitizedName, year);
            return List.of();
        }

        // Filter user clubs to only include filtered PRNs
        List<UserClub> filteredMembers = allMembers.stream()
                .filter(uc -> filteredPrns.contains(uc.getPrn()))
                .collect(Collectors.toList());

        log.info("Filtered {} members to {} for club {} and year {}",
                allMembers.size(), filteredMembers.size(), sanitizedName, year);

        // Fetch profiles in bulk for filtered PRNs
        Map<String, ProfileSummaryResponse> profileMap =
                profileServiceClient.getProfileSummariesBulk(filteredPrns);

        // Map with profile enrichment
        return UserClubMapper.toProfileEnrichedResponseList(filteredMembers, profileMap);
    }
}