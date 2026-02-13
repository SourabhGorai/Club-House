package com.clubservice2.club_service2.service;

import com.clubservice2.club_service2.client.ProfileServiceClient;
import com.clubservice2.club_service2.client.UserServiceClient;
import com.clubservice2.club_service2.config.CacheConfig;
import com.clubservice2.club_service2.dto.request.BulkUserClubRequest;
import com.clubservice2.club_service2.dto.request.UserClubRequest;
import com.clubservice2.club_service2.dto.response.*;
import com.clubservice2.club_service2.exception.*;
import com.clubservice2.club_service2.mapper.ClubMapper;
import com.clubservice2.club_service2.mapper.UserClubMapper;
import com.clubservice2.club_service2.model.Club;
import com.clubservice2.club_service2.model.UserClub;
import com.clubservice2.club_service2.repository.ClubRepository;
import com.clubservice2.club_service2.repository.UserClubRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
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

    @Transactional
    @Caching(evict = {
            @CacheEvict(value = CacheConfig.USER_CLUBS, key = "#request.prn"),
            @CacheEvict(value = CacheConfig.USER_CLUB_NAMES, key = "#request.prn"),
            @CacheEvict(value = CacheConfig.CLUB_MEMBERS, allEntries = true),
            @CacheEvict(value = CacheConfig.CLUB_PRNS, allEntries = true),
            @CacheEvict(value = CacheConfig.CLUB_MEMBERS_BY_YEAR, allEntries = true),
            @CacheEvict(value = CacheConfig.ALL_USER_CLUBS, allEntries = true),
            @CacheEvict(value = CacheConfig.ADMIN_RESPONSE, allEntries = true),
            @CacheEvict(value = CacheConfig.MY_CLUBS, key = "#request.prn"),
            @CacheEvict(value = CacheConfig.USERS_BY_ROLE, allEntries = true)
    })
    public UserClubResponse addUserToClub(UserClubRequest request, String requesterPrn, String role) {
        log.info("Adding user {} to club {}", request.getPrn(), request.getClubId());

        if(!role.equals("SUPER_ADMIN") && !authorize(requesterPrn, request.getClubId())){
            throw new RuntimeException(
                    String.format("You are not authorize to add members in club: %d",
                            request.getClubId())
            );
        }

        userServiceClient.validateUser(request.getPrn());

        Club club = clubRepository.findById(request.getClubId())
                .orElseThrow(() -> {
                    log.error("Club not found with ID: {}", request.getClubId());
                    return new ClubNotFoundException("Club with ID: " + request.getClubId());
                });

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

    @Transactional
    public BulkUserClubResponse addUsersToClubsBulk(
            BulkUserClubRequest request, String prn, String role
    ) {
        log.info("Starting bulk user-club creation for {} associations",
                request.getAssociations().size());

        List<UserClubResponse> successfulAssociations = new ArrayList<>();
        List<BulkUserClubResponse.BulkUserClubError> errors = new ArrayList<>();

        for (UserClubRequest userClubRequest : request.getAssociations()) {
            try {
                UserClubResponse response = addUserToClub(userClubRequest, prn, role);
                successfulAssociations.add(response);

            } catch (UserClubAlreadyExistsException ex) {
                String clubName = getClubNameById(userClubRequest.getClubId());

                errors.add(BulkUserClubResponse.BulkUserClubError.builder()
                        .prn(userClubRequest.getPrn())
                        .clubId(userClubRequest.getClubId())
                        .clubName(clubName)
                        .role(userClubRequest.getRole())
                        .tenure(userClubRequest.getTenure())
                        .errorMessage(String.format(
                                "User-club association already exists for PRN: %s, Club: %s, Role: %s, Tenure: %s",
                                userClubRequest.getPrn(), clubName,
                                userClubRequest.getRole(), userClubRequest.getTenure()))
                        .errorType("DUPLICATE_ASSOCIATION")
                        .build());

            } catch (ClubNotFoundException ex) {
                errors.add(BulkUserClubResponse.BulkUserClubError.builder()
                        .prn(userClubRequest.getPrn())
                        .clubId(userClubRequest.getClubId())
                        .clubName(null)
                        .role(userClubRequest.getRole())
                        .tenure(userClubRequest.getTenure())
                        .errorMessage("Club not found with ID: " + userClubRequest.getClubId())
                        .errorType("CLUB_NOT_FOUND")
                        .build());

            } catch (Exception ex) {
                String errorType = "CREATION_ERROR";
                String errorMessage = ex.getMessage();

                if (errorMessage != null && errorMessage.toLowerCase().contains("user not found")) {
                    errorType = "USER_NOT_FOUND";
                }

                String clubName = getClubNameById(userClubRequest.getClubId());

                log.error("Error creating user-club association for PRN {} and Club {}: {}",
                        userClubRequest.getPrn(), userClubRequest.getClubId(), ex.getMessage());

                errors.add(BulkUserClubResponse.BulkUserClubError.builder()
                        .prn(userClubRequest.getPrn())
                        .clubId(userClubRequest.getClubId())
                        .clubName(clubName)
                        .role(userClubRequest.getRole())
                        .tenure(userClubRequest.getTenure())
                        .errorMessage(errorMessage)
                        .errorType(errorType)
                        .build());
            }
        }

        log.info("Bulk user-club creation completed: {} successful, {} failed",
                successfulAssociations.size(), errors.size());

        return BulkUserClubResponse.builder()
                .totalRequested(request.getAssociations().size())
                .successCount(successfulAssociations.size())
                .failedCount(errors.size())
                .successfulAssociations(successfulAssociations)
                .errors(errors.isEmpty() ? null : errors)
                .build();
    }

    private String getClubNameById(Long clubId) {
        try {
            return clubRepository.findById(clubId)
                    .map(Club::getClubName)
                    .orElse("Unknown Club");
        } catch (Exception e) {
            return "Unknown Club";
        }
    }

    @Transactional(readOnly = true)
    @Cacheable(value = CacheConfig.USER_CLUBS, key = "#prn")
    public List<ProfileEnrichedUserClubResponse> getUserClubs(String prn, String role) {
        log.debug("Fetching clubs for user: {} - Cache miss, loading from DB", prn);

        userServiceClient.validateUser(prn);

        List<UserClub> userClubs = userClubRepository.findByPrn(prn);

        if (userClubs.isEmpty()) {
            log.info("No clubs found for user: {}", prn);
            return List.of();
        }

        log.info("Found {} clubs for user: {}, enriching with profile data", userClubs.size(), prn);

        ProfileSummaryResponse profile = profileServiceClient.getProfileSummary(prn);
        System.out.println(profile);

        return userClubs.stream()
                .map(uc -> UserClubMapper.toProfileEnrichedResponse(uc, profile))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    @Cacheable(value = CacheConfig.USER_CLUB_NAMES, key = "#prn")
    public List<String> getUserClubNames(String prn) {
        log.debug("Fetching club names for user: {} - Cache miss, loading from DB", prn);

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

    @Transactional(readOnly = true)
    @Cacheable(value = CacheConfig.ALL_USER_CLUBS, key = "'all'")
    public List<ProfileEnrichedUserClubResponse> getAllUserClubAssociations() {
        log.debug("Fetching all user-club associations - Cache miss, loading from DB");

        List<UserClub> associations = userClubRepository.findAll();

        if (associations.isEmpty()) {
            log.info("No user-club associations found");
            return List.of();
        }

        log.info("Found {} user-club associations, enriching with profiles", associations.size());

        List<String> prns = associations.stream()
                .map(UserClub::getPrn)
                .distinct()
                .collect(Collectors.toList());

        Map<String, ProfileSummaryResponse> profileMap =
                profileServiceClient.getProfileSummariesBulk(prns);

        return UserClubMapper.toProfileEnrichedResponseList(associations, profileMap);
    }

    @Transactional(readOnly = true)
    @Cacheable(value = CacheConfig.CLUB_MEMBERS, key = "#clubName")
    public List<ProfileEnrichedUserClubResponse> getClubMembers(
            String clubName, String prn, String role
    ) {
        log.debug("Fetching members of club: {} - Cache miss, loading from DB", clubName);

        String sanitizedName = ClubMapper.sanitizeClubName(clubName);

        Club club = clubRepository.findByClubNameAndIsActiveTrue(sanitizedName)
                .orElseThrow(() -> new ClubNotFoundException(sanitizedName));

        List<UserClub> members = userClubRepository.findByClubName(sanitizedName);

        if (members.isEmpty()) {
            log.info("No members found for club: {}", sanitizedName);
            return List.of();
        }

        log.info("Found {} members for club: {}, enriching with profiles",
                members.size(), sanitizedName);

        List<String> prns = members.stream()
                .map(UserClub::getPrn)
                .distinct()
                .collect(Collectors.toList());

        Map<String, ProfileSummaryResponse> profileMap =
                profileServiceClient.getProfileSummariesBulk(prns);

        return UserClubMapper.toProfileEnrichedResponseList(members, profileMap);
    }

    @Transactional
    @Caching(evict = {
            @CacheEvict(value = CacheConfig.USER_CLUBS, key = "#prn"),
            @CacheEvict(value = CacheConfig.USER_CLUB_NAMES, key = "#prn"),
            @CacheEvict(value = CacheConfig.CLUB_MEMBERS, allEntries = true),
            @CacheEvict(value = CacheConfig.CLUB_PRNS, allEntries = true),
            @CacheEvict(value = CacheConfig.CLUB_MEMBERS_BY_YEAR, allEntries = true),
            @CacheEvict(value = CacheConfig.ALL_USER_CLUBS, allEntries = true),
            @CacheEvict(value = CacheConfig.ADMIN_RESPONSE, allEntries = true),
            @CacheEvict(value = CacheConfig.MY_CLUBS, key = "#prn"),
            @CacheEvict(value = CacheConfig.USERS_BY_ROLE, allEntries = true)
    })
    public void removeUserFromClub(String prn, String clubName,
                                   String requesterPrn, String requesterRole) {
        log.info("Removing user {} from club {}", prn, clubName);

        userServiceClient.validateUser(prn);

        String sanitizedName = ClubMapper.sanitizeClubName(clubName);

        UserClub userClub = userClubRepository.findByPrnAndClubName(prn, sanitizedName)
                .orElseThrow(() -> {
                    log.error("User-club association not found: PRN={}, Club={}", prn, sanitizedName);
                    return new UserClubNotFoundException(prn, sanitizedName);
                });

        if(!requesterRole.equals("SUPER_ADMIN")
                && !requesterRole.equals("TEACHERS")
                && !ofThisClub(requesterPrn, userClub.getClub().getClubId())
        ) {
            throw new RuntimeException("You are not authorized to delete members of this club.");
        }

        try {
            userClubRepository.delete(userClub);
            log.info("Successfully removed user {} from club {}", prn, sanitizedName);
        } catch (Exception e) {
            log.error("Failed to remove user from club: PRN={}, Club={}", prn, sanitizedName, e);
            throw new ClubServiceException("Failed to remove user from club", e);
        }
    }

    @Transactional(readOnly = true)
    @Cacheable(value = CacheConfig.CLUB_PRNS, key = "#clubName")
    public ClubPrnsResponse getClubPrns(String clubName) {
        log.debug("Fetching PRNs for club: {} - Cache miss, loading from DB", clubName);

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

    @Transactional(readOnly = true)
    @Cacheable(value = CacheConfig.CLUB_MEMBERS_BY_YEAR, key = "#clubName + '_' + #year")
    public List<ProfileEnrichedUserClubResponse> getClubMembersByYear(String clubName, Integer year) {
        log.info("Fetching club members for club {} filtered by year {} - Cache miss, loading from DB", clubName, year);

        String sanitizedName = ClubMapper.sanitizeClubName(clubName);

        Club club = clubRepository.findByClubNameAndIsActiveTrue(sanitizedName)
                .orElseThrow(() -> new ClubNotFoundException(sanitizedName));

        List<UserClub> allMembers = userClubRepository.findByClubName(sanitizedName);

        if (allMembers.isEmpty()) {
            log.info("No members found for club: {}", sanitizedName);
            return List.of();
        }

        List<String> allPrns = allMembers.stream()
                .map(UserClub::getPrn)
                .distinct()
                .collect(Collectors.toList());

        List<String> filteredPrns = profileServiceClient.filterPrnsByYear(allPrns, year);

        if (filteredPrns.isEmpty()) {
            log.info("No members found for club {} in year {}", sanitizedName, year);
            return List.of();
        }

        List<UserClub> filteredMembers = allMembers.stream()
                .filter(uc -> filteredPrns.contains(uc.getPrn()))
                .collect(Collectors.toList());

        log.info("Filtered {} members to {} for club {} and year {}",
                allMembers.size(), filteredMembers.size(), sanitizedName, year);

        Map<String, ProfileSummaryResponse> profileMap =
                profileServiceClient.getProfileSummariesBulk(filteredPrns);

        return UserClubMapper.toProfileEnrichedResponseList(filteredMembers, profileMap);
    }

    @Transactional
    @Caching(evict = {
            @CacheEvict(value = CacheConfig.USER_CLUBS, key = "#prn"),
            @CacheEvict(value = CacheConfig.USER_CLUB_NAMES, key = "#prn"),
            @CacheEvict(value = CacheConfig.CLUB_MEMBERS, allEntries = true),
            @CacheEvict(value = CacheConfig.CLUB_PRNS, allEntries = true),
            @CacheEvict(value = CacheConfig.CLUB_MEMBERS_BY_YEAR, allEntries = true),
            @CacheEvict(value = CacheConfig.ALL_USER_CLUBS, allEntries = true),
            @CacheEvict(value = CacheConfig.ADMIN_RESPONSE, allEntries = true),
            @CacheEvict(value = CacheConfig.MY_CLUBS, key = "#prn"),
            @CacheEvict(value = CacheConfig.USERS_BY_ROLE, allEntries = true)
    })
    public void permanentlyDelete(String prn) {
        log.info("Attempting to delete club user with PRN: {}", prn);

        if (!userClubRepository.existsByPrn(prn)) {
            throw new UserNotFoundException(
                    String.format("User not found in any club with PRN: %s", prn)
            );
        }

        long deletedCount = userClubRepository.deleteByPrn(prn);

        log.info("Deleted {} club memberships for PRN: {}", deletedCount, prn);
    }

    @Transactional(readOnly = true)
    @Cacheable(value = CacheConfig.USERS_BY_ROLE, key = "#role")
    public List<ProfileEnrichedUserClubResponse> getAllByRole(String role) {

        String sanitizedRole = UserClubMapper.sanitizeRole(role);

        log.info("Attempting to fetch all the users from clubs with role: {} - Cache miss, loading from DB", sanitizedRole);

        List<UserClub> members = userClubRepository.findByRole(sanitizedRole);

        if (members.isEmpty()) {
            log.info("No members found with role: {}", sanitizedRole);
            return List.of();
        }

        log.info("Found {} members with role: {}, enriching with profiles",
                members.size(), sanitizedRole);

        List<String> prns = members.stream()
                .map(UserClub::getPrn)
                .distinct()
                .collect(Collectors.toList());

        Map<String, ProfileSummaryResponse> profileMap =
                profileServiceClient.getProfileSummariesBulk(prns);

        return UserClubMapper.toProfileEnrichedResponseList(members, profileMap);

    }

    @Transactional(readOnly = true)
    @Cacheable(value = CacheConfig.MY_CLUBS, key = "#prn")
    public List<GeneralClubResponse> getMyClubs(String prn) {

        log.info("Attempting to fetch my clubs for PRN: {} - Cache miss, loading from DB", prn);

        List<UserClub> clubs = userClubRepository.findByPrn(prn);

        if (clubs.isEmpty()) {
            log.info("No clubs found for PRN: {}", prn);
            return List.of();
        }

        List<GeneralClubResponse> response = clubs.stream()
                .map(userClub -> {
                    Club club = userClub.getClub();
                    Long size = userClubRepository.countByClub_ClubId(club.getClubId());
                    return GeneralClubResponse.builder()
                            .clubId(club.getClubId())
                            .clubName(club.getClubName())
                            .desc(club.getClubDesc())
                            .memberCount(size)
                            .build();
                })
                .distinct()
                .toList();

        log.info("Found {} clubs for PRN: {}", response.size(), prn);
        return response;
    }


    public boolean authorize(String prn, Long clubId){

        UserClub user = userClubRepository.findByPrnAndClub_ClubId(prn, clubId);

        if (user == null) {
            return false;
        }

        String clubRole = user.getRole();
        return clubRole.equals("TEACHERS") || clubRole.equals("CLUB_ADMIN");
    }

    private boolean ofThisClub(String prn, Long clubId) {
        UserClub user = userClubRepository.findByPrnAndClub_ClubId(prn, clubId);
        if(user == null) return false;
        String clubRole = user.getRole();
        return clubRole.equals("CLUB_ADMIN")
                || clubRole.equals("TEACHERS")
                || clubRole.equals("TEAM_MEMBERS");
    }
}