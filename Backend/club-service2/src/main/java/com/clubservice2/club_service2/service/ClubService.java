package com.clubservice2.club_service2.service;

import com.clubservice2.club_service2.client.ProfileServiceClient;
import com.clubservice2.club_service2.config.CacheConfig;
import com.clubservice2.club_service2.dto.request.ClubRequest;
import com.clubservice2.club_service2.dto.response.AdminResponse;
import com.clubservice2.club_service2.dto.response.ClubResponse;
import com.clubservice2.club_service2.dto.response.ClubSummaryResponse;
import com.clubservice2.club_service2.dto.response.ProfileSummaryResponse;
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
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.CachePut;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ClubService {

    private final ClubRepository clubRepository;
    private final UserClubRepository userClubRepository;
    private final ProfileServiceClient profileServiceClient;

    @Transactional
    @Caching(evict = {
            @CacheEvict(value = CacheConfig.ALL_CLUBS, allEntries = true),
            @CacheEvict(value = CacheConfig.ACTIVE_CLUBS, allEntries = true),
            @CacheEvict(value = CacheConfig.PUBLIC_CLUBS, allEntries = true)
    })
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

    @Transactional
    @Caching(evict = {
            @CacheEvict(value = CacheConfig.CLUB_BY_NAME, key = "#clubName"),
            @CacheEvict(value = CacheConfig.ALL_CLUBS, allEntries = true),
            @CacheEvict(value = CacheConfig.ACTIVE_CLUBS, allEntries = true),
            @CacheEvict(value = CacheConfig.PUBLIC_CLUBS, allEntries = true),
            @CacheEvict(value = CacheConfig.ADMIN_RESPONSE, allEntries = true),
            @CacheEvict(value = CacheConfig.CLUB_MEMBERS, allEntries = true),
            @CacheEvict(value = CacheConfig.CLUB_PRNS, allEntries = true),
            @CacheEvict(value = CacheConfig.CLUB_MEMBERS_BY_YEAR, allEntries = true)
    })
    public void deleteClub(String clubName) {
        log.info("Deleting club: {}", clubName);

        String sanitizedName = ClubMapper.sanitizeClubName(clubName);

        Club club = clubRepository.findByClubNameAndIsActiveTrue(sanitizedName)
                .orElseThrow(() -> {
                    log.error("Club not found for deletion: {}", sanitizedName);
                    return new ClubNotFoundException(sanitizedName);
                });

        try {
            // Delete all members with this club ID
            userClubRepository.deleteByClub_ClubId(club.getClubId());
            club.setIsActive(false);
            club.setDeletedAt(LocalDateTime.now());
            clubRepository.save(club);
            log.info("Successfully deleted club: {}", sanitizedName);
        } catch (Exception e) {
            log.error("Failed to delete club: {}", sanitizedName, e);
            throw new ClubServiceException("Failed to delete club: " + sanitizedName, e);
        }
    }

    @Transactional(readOnly = true)
    @Cacheable(value = CacheConfig.ALL_CLUBS, key = "'all'")
    public List<ClubResponse> getAllClubs() {
        log.debug("Fetching all clubs - Cache miss, loading from DB");
        List<Club> clubs = clubRepository.findAll();
        log.info("Found {} clubs", clubs.size());
        return ClubMapper.toResponseList(clubs);
    }

    @Transactional(readOnly = true)
    @Cacheable(value = CacheConfig.ACTIVE_CLUBS, key = "'active'")
    public List<ClubResponse> getActiveClubs() {
        log.debug("Fetching active clubs - Cache miss, loading from DB");
        List<Club> clubs = clubRepository.findAllActiveClubs();
        log.info("Found {} active clubs", clubs.size());
        return ClubMapper.toResponseList(clubs);
    }

    @Transactional(readOnly = true)
    @Cacheable(value = CacheConfig.PUBLIC_CLUBS, key = "'public'")
    public List<ClubSummaryResponse> getPublicClubSummaries() {
        log.debug("Fetching public club summaries - Cache miss, loading from DB");
        List<Club> clubs = clubRepository.findAllActiveClubs();
        log.info("Found {} active clubs for public view", clubs.size());
        return ClubMapper.toSummaryResponseList(clubs);
    }

    @Transactional(readOnly = true)
    @Cacheable(value = CacheConfig.CLUB_BY_NAME, key = "#clubName")
    public ClubResponse getClubByName(String clubName) {
        log.debug("Fetching club by name: {} - Cache miss, loading from DB", clubName);

        String sanitizedName = ClubMapper.sanitizeClubName(clubName);
        Club club = clubRepository.findByClubNameAndIsActiveTrue(sanitizedName)
                .orElseThrow(() -> new ClubNotFoundException(sanitizedName));

        return ClubMapper.toResponse(club);
    }

    @Transactional(readOnly = true)
    @Cacheable(value = CacheConfig.ADMIN_RESPONSE, key = "#clubId")
    public AdminResponse getAdminResponse(Long clubId) {
        log.debug("Fetching data for the admin request for clubId: {} - Cache miss, loading from DB", clubId);

        Club club = clubRepository.findById(clubId)
                .orElseThrow(() -> new ClubNotFoundException("Club not found with id: " + clubId));

        long totalCount = userClubRepository.countByClub_ClubId(clubId);

        List<UserClub> FACULTY = userClubRepository.findByClubIdAndRole(clubId, "FACULTY");
        if (FACULTY.isEmpty()) {
            FACULTY = userClubRepository.findByClubIdAndRole(clubId, "FACULTY");
        }

        String teacherPrn = null;
        String teacherName = "Not Assigned";
        String teacherDepartment = "No Department";

        if (!FACULTY.isEmpty()) {
            teacherPrn = FACULTY.get(0).getPrn();
            log.debug("Found teacher with PRN: {}", teacherPrn);
            try {
                ProfileSummaryResponse teacherProfile = profileServiceClient.getProfileSummary(teacherPrn);
                System.out.println(teacherProfile);
                if (teacherProfile != null && teacherProfile.getFullName() != null
                        && !teacherProfile.getFullName().trim().isEmpty()
                        && !"N/A".equals(teacherProfile.getFullName())) {
                    teacherName = teacherProfile.getFullName();
                    teacherDepartment = teacherProfile.getDepartment();
                    log.debug("Fetched teacher profile: {} - {}", teacherPrn, teacherName);
                } else {
                    log.warn("Teacher profile returned null or empty name for PRN: {}", teacherPrn);
                    teacherName = teacherPrn;
                }
            } catch (Exception e) {
                log.error("Failed to fetch teacher profile for PRN: {}", teacherPrn, e);
                teacherName = teacherPrn;
            }
        }

        List<UserClub> admins = userClubRepository.findByClubIdAndRole(clubId, "CLUB_ADMIN");

        List<AdminResponse.AdminInfo> clubAdminsList;

        if (admins.isEmpty()) {
            clubAdminsList = List.of();
        } else {
            List<String> uniqueAdminPrns = admins.stream()
                    .map(UserClub::getPrn)
                    .distinct()
                    .collect(Collectors.toList());

            Map<String, ProfileSummaryResponse> profileMap =
                    profileServiceClient.getProfileSummariesBulk(uniqueAdminPrns);

            clubAdminsList = uniqueAdminPrns.stream()
                    .map(prn -> {
                        ProfileSummaryResponse profile = profileMap.get(prn);
                        if (profile != null && profile.getFullName() != null
                                && !"N/A".equals(profile.getFullName())) {
                            log.debug("Fetched admin profile: {} - {}", prn, profile.getFullName());
                            return AdminResponse.AdminInfo.builder()
                                    .prn(prn)
                                    .name(profile.getFullName())
                                    .department(profile.getDepartment())
                                    .year(profile.getYear())
                                    .build();
                        } else {
                            log.error("Failed to fetch admin profile for PRN: {}", prn);
                            return AdminResponse.AdminInfo.builder()
                                    .prn(prn)
                                    .name(prn)
                                    .build();
                        }
                    })
                    .collect(Collectors.toList());
        }

        AdminResponse resp = AdminResponse.builder()
                .clubName(club.getClubName())
                .clubDesc(club.getClubDesc())
                .teacherPrn(teacherPrn)
                .teacherName(teacherName)
                .teacherDepartment(teacherDepartment)
                .clubAdmins(clubAdminsList)
                .totalCount(totalCount)
                .build();

        log.info("Successfully fetched admin response for club: {} with {} members and {} admins",
                club.getClubName(), totalCount, clubAdminsList.size());
        return resp;
    }

    public ClubResponse getById(Long id) {
        log.info("Attempting to fetch club with id: {}", id);
        Club club = clubRepository.findById(id).orElseThrow(() -> new ClubNotFoundException(id.toString()));
        return ClubMapper.toResponse(club);
    }
}