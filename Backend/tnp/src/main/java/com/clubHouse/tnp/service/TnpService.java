package com.clubHouse.tnp.service;

import com.clubHouse.tnp.client.ProfileManagementServiceClient;
import com.clubHouse.tnp.config.CacheConfig;
import com.clubHouse.tnp.dto.request.AddUserRequest;
import com.clubHouse.tnp.dto.request.BulkUserTnpRequest;
import com.clubHouse.tnp.dto.request.RoleTenureChangeRequest;
import com.clubHouse.tnp.dto.response.*;
import com.clubHouse.tnp.exception.*;
import com.clubHouse.tnp.mapper.TnpMapper;
import com.clubHouse.tnp.model.Tnp;
import com.clubHouse.tnp.model.TnpRoles;
import com.clubHouse.tnp.repository.TnpRepository;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class TnpService {

    private final TnpRepository tnpRepository;
    private final ProfileManagementServiceClient profileManagementServiceClient;


    // ── Public Methods ───────────────────────────────────────────────────────────

    // Roles are static enum values — cache forever, no eviction needed
    @Cacheable(value = CacheConfig.TNP_ROLES)
    public List<String> getAllClubRoles() {

        log.info("Attempting to fetch all the roles for TNP - Cache miss, loading from source");

        return Arrays.stream(TnpRoles.values())
                .map(Enum::toString)
                .toList();
    }

    // Not cached — this is an auth check, must always be fresh
    public boolean authorize(String prn) {

        log.info("Checking authorization for prn: {}", prn);

        Tnp user = tnpRepository.findByPrnAndIsActiveTrue(prn);
        if (user == null) return false;

        return user.getRole() == TnpRoles.TNP_HEAD ||
                user.getRole() == TnpRoles.PRESIDENT ||
                user.getRole() == TnpRoles.VICE_PRESIDENT;
    }

    @Caching(evict = {
            @CacheEvict(value = CacheConfig.TNP_MEMBER_BY_PRN, key = "#request.prn"),
            @CacheEvict(value = CacheConfig.TNP_ALL_ACTIVE_MEMBERS, allEntries = true),
            @CacheEvict(value = CacheConfig.TNP_ALL_INACTIVE_MEMBERS, allEntries = true),
            @CacheEvict(value = CacheConfig.TNP_MEMBERS_BY_ROLE, allEntries = true),
            @CacheEvict(value = CacheConfig.TNP_MEMBERS_BY_YEAR, allEntries = true)
    })
    public UserTnpResponse addUserToClub(@Valid AddUserRequest request, String prn, String role) {

        log.info("Attempting to add a new member to TNP with prn: {}", request.getPrn());

        if (!role.equals("SUPER_ADMIN") && !authorize(prn)) {
            throw new UnauthorizedException("You are not authorized to add members in TNP");
        }

        Tnp user = tnpRepository.findByPrn(request.getPrn());
        if (user != null) {
            log.info("User already exists with prn: {}", request.getPrn());
            return TnpMapper.toResponse(user);
        }

        Tnp newUser = Tnp.builder()
                .prn(request.getPrn())
                .role(request.getRole())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .isActive(true)
                .build();

        try {
            Tnp saved = tnpRepository.save(newUser);
            log.info("Added {} to TNP with role: {}", saved.getPrn(), saved.getRole());
            return TnpMapper.toResponse(saved);
        } catch (Exception e) {
            throw new ServiceException("Failed to add user in db");
        }
    }

    @Caching(evict = {
            @CacheEvict(value = CacheConfig.TNP_ALL_ACTIVE_MEMBERS, allEntries = true),
            @CacheEvict(value = CacheConfig.TNP_ALL_INACTIVE_MEMBERS, allEntries = true),
            @CacheEvict(value = CacheConfig.TNP_MEMBERS_BY_ROLE, allEntries = true),
            @CacheEvict(value = CacheConfig.TNP_MEMBERS_BY_YEAR, allEntries = true)
    })
    public BulkUserTnpResponse addUsersToTnpBulk(BulkUserTnpRequest request,
                                                 String callerPrn, String callerRole) {

        log.info("Attempting bulk addition of {} TNP members", request.getAssociations().size());

        if (!callerRole.equals("SUPER_ADMIN") && !authorize(callerPrn)) {
            throw new UnauthorizedException("You are not authorized to perform bulk user additions in TNP");
        }

        List<UserTnpResponse> successList = new ArrayList<>();
        List<BulkUserTnpResponse.FailedEntry> failedList = new ArrayList<>();

        for (AddUserRequest assoc : request.getAssociations()) {
            try {
                UserTnpResponse result = processSingleAssociation(assoc);
                successList.add(result);
            } catch (Exception e) {
                log.warn("Failed to add user PRN={} with role={}: {}",
                        assoc.getPrn(), assoc.getRole(), e.getMessage());
                failedList.add(BulkUserTnpResponse.FailedEntry.builder()
                        .prn(assoc.getPrn())
                        .role(assoc.getRole() != null ? assoc.getRole().toString() : null)
                        .startDate(assoc.getStartDate())
                        .endDate(assoc.getEndDate())
                        .reason(e.getMessage())
                        .build());
            }
        }

        return BulkUserTnpResponse.builder()
                .successCount(successList.size())
                .failedCount(failedList.size())
                .successful(successList)
                .failed(failedList)
                .build();
    }

    @Cacheable(value = CacheConfig.TNP_MEMBER_BY_PRN, key = "#prn")
    public ProfileEnrichedUserResponse getByPrn(String prn) {

        log.info("Attempting to fetch profile of user with PRN: {} - Cache miss, loading from DB", prn);

        Tnp user = tnpRepository.findByPrn(prn);
        if (user == null) return null;

        ProfileResponse profile = profileManagementServiceClient.getProfileByPrn(prn);

        return TnpMapper.toProfileEnrichedResponse(user, profile);
    }

    @Caching(cacheable = {
            @Cacheable(value = CacheConfig.TNP_ALL_ACTIVE_MEMBERS, condition = "#activeStatus == true"),
            @Cacheable(value = CacheConfig.TNP_ALL_INACTIVE_MEMBERS, condition = "#activeStatus == false")
    })
    public List<ProfileEnrichedUserResponse> getAllMembers(boolean activeStatus) {

        log.info("Attempting to fetch all {} members of TNP - Cache miss, loading from DB",
                activeStatus ? "active" : "inactive");

        List<Tnp> members = activeStatus
                ? fetchAllActiveMembers()
                : fetchAllInActiveMembers();

        if (members.isEmpty()) return List.of();

        Map<String, ProfileResponse> profilePrnMap = buildProfileMap(members);

        return TnpMapper.toProfileEnrichedResponseList(members, profilePrnMap);
    }

    @Cacheable(value = CacheConfig.TNP_MEMBERS_BY_YEAR, key = "#year")
    public List<ProfileEnrichedUserResponse> getMembersByYear(
            @NotNull(message = "Year is required") Integer year
    ) {

        log.info("Attempting to fetch all active TNP members of year: {} - Cache miss, loading from DB", year);

        List<Tnp> members = fetchAllActiveMembers();
        if (members.isEmpty()) return List.of();

        Map<String, ProfileResponse> profilePrnMap = buildProfileMap(members);

        List<Tnp> filteredMembers = members.stream()
                .filter(member -> {
                    ProfileResponse profile = profilePrnMap.get(member.getPrn());
                    return profile != null && year.equals(profile.getYear());
                })
                .toList();

        if (filteredMembers.isEmpty()) return List.of();

        Set<String> filteredPrns = filteredMembers.stream()
                .map(Tnp::getPrn)
                .collect(Collectors.toSet());

        Map<String, ProfileResponse> filteredProfileMap = profilePrnMap.entrySet().stream()
                .filter(entry -> filteredPrns.contains(entry.getKey()))
                .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue));

        return TnpMapper.toProfileEnrichedResponseList(filteredMembers, filteredProfileMap);
    }


    @Caching(evict = {
            @CacheEvict(value = CacheConfig.TNP_MEMBER_BY_PRN, key = "#prn"),
            @CacheEvict(value = CacheConfig.TNP_ALL_ACTIVE_MEMBERS, allEntries = true),
            @CacheEvict(value = CacheConfig.TNP_ALL_INACTIVE_MEMBERS, allEntries = true),
            @CacheEvict(value = CacheConfig.TNP_MEMBERS_BY_ROLE, allEntries = true),
            @CacheEvict(value = CacheConfig.TNP_MEMBERS_BY_YEAR, allEntries = true)
    })
    @Transactional
    public void softDelete(String prn, String requesterPrn, String role) {

        log.info("Attempting to perform soft delete on user: {}", prn);

        if (!role.equals("SUPER_ADMIN") && !authorize(requesterPrn)) {
            throw new UnauthorizedException("You are not authorized to delete members from TNP");
        }

        Tnp member = tnpRepository.findByPrn(prn);
        if(member == null){
            throw new UserNotFoundException(
                    String.format("Member with prn %d, not found", prn));
        }

        try{
            member.Deactivate();
            tnpRepository.save(member);
            log.info("Deletion successful");
        } catch (Exception e) {
            log.info("Deletion failed");
            throw new RuntimeException("Failed to remove user from tnp");
        }

    }

    @Caching(evict = {
            @CacheEvict(value = CacheConfig.TNP_MEMBER_BY_PRN, key = "#prn"),
            @CacheEvict(value = CacheConfig.TNP_ALL_ACTIVE_MEMBERS, allEntries = true),
            @CacheEvict(value = CacheConfig.TNP_ALL_INACTIVE_MEMBERS, allEntries = true),
            @CacheEvict(value = CacheConfig.TNP_MEMBERS_BY_ROLE, allEntries = true),
            @CacheEvict(value = CacheConfig.TNP_MEMBERS_BY_YEAR, allEntries = true)
    })
    @Transactional
    public void permanentlyDelete(String prn, String requesterPrn, String role) {

        log.info("Attempting to permanently delete user with prn: {}", prn);

        if (!role.equals("SUPER_ADMIN") && !authorize(requesterPrn)) {
            throw new UnauthorizedException("You are not authorized to delete members from TNP");
        }

        Tnp user = tnpRepository.findByPrn(prn);
        if (user == null) {
            throw new ResourceNotFoundException(
                    String.format("No TNP member found with PRN: %s", prn)
            );
        }

        tnpRepository.delete(user);
        log.info("Permanently deleted TNP member with PRN: {}", prn);
    }

    @Cacheable(value = CacheConfig.TNP_MEMBERS_BY_ROLE, key = "#role")
    public List<ProfileEnrichedUserResponse> getAllByRole(String role) {

        log.info("Attempting to fetch members by their role: {} - Cache miss, loading from DB", role);

        TnpRoles tnpRole;
        try {
            tnpRole = TnpRoles.valueOf(role.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new InvalidRequestException(
                    String.format("Invalid role: %s. Valid roles are: %s",
                            role, Arrays.toString(TnpRoles.values()))
            );
        }

        List<Tnp> members = tnpRepository.findByRoleAndIsActiveTrue(tnpRole);
        if (members.isEmpty()) return List.of();

        Map<String, ProfileResponse> profilePrnMap = buildProfileMap(members);

        return TnpMapper.toProfileEnrichedResponseList(members, profilePrnMap);
    }

    // NOTE: Paginated methods are NOT cached — unbounded page/size key combinations
    //       make cache management impractical, consistent with CompanyMasterService approach.
    public PageResponse<ProfileEnrichedUserResponse> getAllMembersPaged(Pageable pageable) {

        log.info("Attempting to fetch all active members in paginated format - page: {}, size: {}",
                pageable.getPageNumber(), pageable.getPageSize());

        Pageable sortedPageable = PageRequest.of(
                pageable.getPageNumber(),
                pageable.getPageSize(),
                Sort.by(Sort.Direction.ASC, "tnpId")
        );

        Page<Tnp> memberPage = tnpRepository.findAllByIsActiveTrue(sortedPageable);

        if (memberPage.isEmpty()) {
            return PageResponse.<ProfileEnrichedUserResponse>builder()
                    .content(List.of())
                    .pageNumber(memberPage.getNumber())
                    .pageSize(memberPage.getSize())
                    .totalElements(memberPage.getTotalElements())
                    .totalPages(memberPage.getTotalPages())
                    .last(memberPage.isLast())
                    .build();
        }

        Map<String, ProfileResponse> profilePrnMap = buildProfileMap(memberPage.getContent());

        Page<ProfileEnrichedUserResponse> enrichedPage = memberPage.map(
                tnp -> TnpMapper.toProfileEnrichedResponse(tnp, profilePrnMap.get(tnp.getPrn()))
        );

        return PageResponse.from(enrichedPage);
    }

    // NOTE: Paginated + filtered by year — not cached for same reason as above.
    public PageResponse<ProfileEnrichedUserResponse> getMembersByYearPaged(
            @NotNull(message = "Year is required") Integer year, Pageable pageable) {

        log.info("Attempting to fetch active TNP members of year: {} in paginated format - page: {}, size: {}",
                year, pageable.getPageNumber(), pageable.getPageSize());

        Pageable sortedPageable = PageRequest.of(
                pageable.getPageNumber(),
                pageable.getPageSize(),
                Sort.by(Sort.Direction.ASC, "tnpId")
        );

        Page<Tnp> memberPage = tnpRepository.findAllByIsActiveTrue(sortedPageable);

        if (memberPage.isEmpty()) {
            return PageResponse.<ProfileEnrichedUserResponse>builder()
                    .content(List.of())
                    .pageNumber(memberPage.getNumber())
                    .pageSize(memberPage.getSize())
                    .totalElements(0L)
                    .totalPages(0)
                    .last(true)
                    .build();
        }

        Map<String, ProfileResponse> profilePrnMap = buildProfileMap(memberPage.getContent());

        List<ProfileEnrichedUserResponse> filteredContent = memberPage.getContent().stream()
                .filter(member -> {
                    ProfileResponse profile = profilePrnMap.get(member.getPrn());
                    return profile != null && year.equals(profile.getYear());
                })
                .map(member -> TnpMapper.toProfileEnrichedResponse(
                        member, profilePrnMap.get(member.getPrn()))
                )
                .toList();

        return PageResponse.<ProfileEnrichedUserResponse>builder()
                .content(filteredContent)
                .pageNumber(memberPage.getNumber())
                .pageSize(memberPage.getSize())
                .totalElements(filteredContent.size())
                .totalPages(memberPage.getTotalPages())
                .last(memberPage.isLast())
                .build();
    }

    @Caching(evict = {
            @CacheEvict(value = CacheConfig.TNP_MEMBER_BY_PRN, key = "#req.prn"),
            @CacheEvict(value = CacheConfig.TNP_ALL_ACTIVE_MEMBERS, allEntries = true),
            @CacheEvict(value = CacheConfig.TNP_ALL_INACTIVE_MEMBERS, allEntries = true),
            @CacheEvict(value = CacheConfig.TNP_MEMBERS_BY_ROLE, allEntries = true),
            @CacheEvict(value = CacheConfig.TNP_MEMBERS_BY_YEAR, allEntries = true)
    })
    @Transactional
    public void changeRoleTenure(
            @Valid RoleTenureChangeRequest req,
            String prn,
            String role
    ) {

        log.info("Attempting to change the role & tenure of the user with prn: {}", req.getPrn());

        if (req.getNewRole() == TnpRoles.TNP_HEAD && !role.equals("SUPER_ADMIN")) {
            throw new UnauthorizedException(
                    String.format("Only SUPER_ADMIN can assign TNP_HEAD. Your role: %s", role)
            );
        }

        if (!role.equals("SUPER_ADMIN")) {
            Tnp requester = tnpRepository.findByPrn(prn);
            if (requester == null) {
                throw new UnauthorizedException("You are not a member of TNP");
            }
            if (requester.getRole() != TnpRoles.TNP_HEAD) {
                throw new UnauthorizedException(
                        String.format("Only TNP_HEAD can change roles. Your role: %s",
                                requester.getRole())
                );
            }
        }

        Tnp user = tnpRepository.findByPrn(req.getPrn());
        if (user == null) {
            throw new ResourceNotFoundException(
                    String.format("No TNP member found with PRN: %s", req.getPrn())
            );
        }

        user.setStartDate(req.getStartDate());
        user.setEndDate(req.getEndDate());
        user.setRole(req.getNewRole());

        tnpRepository.save(user);
        log.info("Role/Tenure changed successfully for PRN: {}", req.getPrn());
    }


    // ── Private Helpers ──────────────────────────────────────────────────────────

    private List<Tnp> fetchAllActiveMembers() {
        return tnpRepository.findAllByIsActiveTrue();
    }

    private List<Tnp> fetchAllInActiveMembers() {
        return tnpRepository.findAllByIsActiveFalse();
    }

    private Map<String, ProfileResponse> buildProfileMap(List<Tnp> members) {
        List<String> prnList = members.stream()
                .map(Tnp::getPrn)
                .toList();

        List<ProfileResponse> profiles = profileManagementServiceClient
                .getProfilesByPrns(prnList);

        return profiles.stream()
                .collect(Collectors.toMap(ProfileResponse::getPrn, Function.identity()));
    }

    @Transactional
    private UserTnpResponse processSingleAssociation(AddUserRequest assoc) {

        Optional<Tnp> existing = tnpRepository
                .findByPrnAndRoleAndStartDateAndEndDate(
                        assoc.getPrn(), assoc.getRole(),
                        assoc.getStartDate(), assoc.getEndDate()
                );

        if (existing.isPresent()) {
            Tnp tnp = existing.get();

            if (tnp.isActive()) {
                throw new DuplicateResourceException(
                        String.format("User PRN=%s already has role=%s, startDate=%s, endDate=%s",
                                assoc.getPrn(), assoc.getRole(),
                                assoc.getStartDate(), assoc.getEndDate())
                );
            }

            tnp.Activate();
            Tnp saved = tnpRepository.save(tnp);
            log.info("Reactivated existing TNP entry for PRN={}, role={}, startDate={}, endDate={}",
                    assoc.getPrn(), assoc.getRole(), assoc.getStartDate(), assoc.getEndDate());
            return TnpMapper.toResponse(saved);
        }

        Tnp newTnp = Tnp.builder()
                .prn(assoc.getPrn())
                .role(assoc.getRole())
                .startDate(assoc.getStartDate())
                .endDate(assoc.getEndDate())
                .build();

        Tnp saved = tnpRepository.save(newTnp);
        log.info("Created new TNP entry for PRN={}, role={}, startDate={}, endDate={}",
                assoc.getPrn(), assoc.getRole(), assoc.getStartDate(), assoc.getEndDate());
        return TnpMapper.toResponse(saved);
    }

}