package com.clubHouse.tnp.service;

import com.clubHouse.tnp.client.ProfileManagementServiceClient;
import com.clubHouse.tnp.config.CacheConfig;
import com.clubHouse.tnp.dto.request.BulkPlacementRequest;
import com.clubHouse.tnp.dto.request.PlacementRequest;
import com.clubHouse.tnp.dto.response.BulkPlacementResponse;
import com.clubHouse.tnp.dto.response.PlacementResponse;
import com.clubHouse.tnp.dto.response.PlacementStatsResponse;
import com.clubHouse.tnp.dto.response.ProfileResponse;
import com.clubHouse.tnp.exception.DuplicateResourceException;
import com.clubHouse.tnp.exception.ResourceNotFoundException;
import com.clubHouse.tnp.exception.UnauthorizedException;
import com.clubHouse.tnp.model.Company;
import com.clubHouse.tnp.model.Placement;
import com.clubHouse.tnp.model.Tnp;
import com.clubHouse.tnp.repository.CompanyRepository;
import com.clubHouse.tnp.repository.PlacementRepository;
import com.clubHouse.tnp.repository.TnpRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class PlacementService {

    private final PlacementRepository placementRepository;
    private final CompanyRepository companyRepository;
    private final ProfileManagementServiceClient profileClient;
    private final TnpRepository tnpRepository;

    // ── Of-TNP? ──────────────────────────────────────────────────────────────

    // Not cached — auth check must always be fresh
    private boolean notOfTnp(String prn, String role) {
        Tnp user = tnpRepository.findByPrnAndIsActiveTrue(prn);
        return user == null && !role.equals("SUPER_ADMIN");
    }

    // ── Create ───────────────────────────────────────────────────────────────

    @Caching(evict = {
            @CacheEvict(value = CacheConfig.PLACEMENTS_BY_PRN, key = "#request.studentPrn"),
            @CacheEvict(value = CacheConfig.PLACEMENTS_BY_SESSION, allEntries = true),
            @CacheEvict(value = CacheConfig.PLACEMENT_STATS_BY_SESSION, allEntries = true),
            // Placement creation affects studentsHired counts and overall stats
            @CacheEvict(value = CacheConfig.COMPANY_BY_ID, key = "#request.companyId"),
            @CacheEvict(value = CacheConfig.ALL_COMPANIES, allEntries = true),
            @CacheEvict(value = CacheConfig.COMPANIES_BY_SESSION, allEntries = true),
            @CacheEvict(value = CacheConfig.COMPANIES_BY_MIN_HIRED, allEntries = true),
            @CacheEvict(value = CacheConfig.COMBINED_PACKAGES_BY_SESSION, allEntries = true),
            @CacheEvict(value = CacheConfig.COMPANY_OVERALL_STATS, allEntries = true)
    })
    @Transactional
    public PlacementResponse createPlacement(PlacementRequest request, String prn, String role) {

        if (notOfTnp(prn, role)) {
            throw new UnauthorizedException("You are not a member of TNP");
        }

        ProfileResponse profile = profileClient.getProfileByPrn(request.getStudentPrn());
        if (profile == null) {
            throw new ResourceNotFoundException(
                    "Student with PRN " + request.getStudentPrn() + " not found");
        }

        Company company = companyRepository.findById(request.getCompanyId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Company not found with id: " + request.getCompanyId()));

        if (placementRepository.existsByStudentPrnAndCompany_CompanyId(
                request.getStudentPrn(), request.getCompanyId())) {
            throw new DuplicateResourceException(
                    "Placement already exists for PRN " + request.getStudentPrn()
                            + " with company id " + request.getCompanyId());
        }

        Placement placement = Placement.builder()
                .studentPrn(request.getStudentPrn())
                .company(company)
                .role(request.getRole())
                .packageOffered(request.getPackageOffered())
                .placedAt(LocalDateTime.now())
                .build();

        placement = placementRepository.save(placement);
        log.info("Placement created: id={}, prn={}, company={}",
                placement.getPlacementId(), placement.getStudentPrn(), company.getName());

        return toResponse(placement, profile);
    }

    @Caching(evict = {
            @CacheEvict(value = CacheConfig.PLACEMENTS_BY_PRN, allEntries = true),
            @CacheEvict(value = CacheConfig.PLACEMENTS_BY_SESSION, allEntries = true),
            @CacheEvict(value = CacheConfig.PLACEMENT_STATS_BY_SESSION, allEntries = true),
            @CacheEvict(value = CacheConfig.ALL_COMPANIES, allEntries = true),
            @CacheEvict(value = CacheConfig.COMPANIES_BY_SESSION, allEntries = true),
            @CacheEvict(value = CacheConfig.COMPANIES_BY_MIN_HIRED, allEntries = true),
            @CacheEvict(value = CacheConfig.COMBINED_PACKAGES_BY_SESSION, allEntries = true),
            @CacheEvict(value = CacheConfig.COMPANY_OVERALL_STATS, allEntries = true)
    })
    @Transactional
    public BulkPlacementResponse createBulkPlacements(
            BulkPlacementRequest bulkRequest, String prn, String role
    ) {

        if (notOfTnp(prn, role)) {
            throw new UnauthorizedException("You are not a member of TNP");
        }

        List<PlacementResponse> succeeded = new ArrayList<>();
        List<BulkPlacementResponse.BulkPlacementFailure> failed = new ArrayList<>();

        for (PlacementRequest request : bulkRequest.getPlacements()) {
            try {
                ProfileResponse profile = profileClient.getProfileByPrn(request.getStudentPrn());
                if (profile == null) {
                    throw new ResourceNotFoundException(
                            "Student with PRN " + request.getStudentPrn() + " not found");
                }

                Company company = companyRepository.findById(request.getCompanyId())
                        .orElseThrow(() -> new ResourceNotFoundException(
                                "Company not found with id: " + request.getCompanyId()));

                if (placementRepository.existsByStudentPrnAndCompany_CompanyId(
                        request.getStudentPrn(), request.getCompanyId())) {
                    throw new DuplicateResourceException(
                            "Placement already exists for PRN " + request.getStudentPrn()
                                    + " with company id " + request.getCompanyId());
                }

                Placement placement = Placement.builder()
                        .studentPrn(request.getStudentPrn())
                        .company(company)
                        .role(request.getRole())
                        .packageOffered(request.getPackageOffered())
                        .placedAt(LocalDateTime.now())
                        .build();

                placement = placementRepository.save(placement);
                log.info("Bulk placement created: id={}, prn={}, company={}",
                        placement.getPlacementId(), placement.getStudentPrn(), company.getName());

                succeeded.add(toResponse(placement, profile));

            } catch (Exception e) {
                log.warn("Bulk placement failed for PRN={}, companyId={}: {}",
                        request.getStudentPrn(), request.getCompanyId(), e.getMessage());

                failed.add(BulkPlacementResponse.BulkPlacementFailure.builder()
                        .studentPrn(request.getStudentPrn())
                        .companyId(request.getCompanyId())
                        .reason(e.getMessage())
                        .build());
            }
        }

        return BulkPlacementResponse.builder()
                .totalRequested(bulkRequest.getPlacements().size())
                .successCount(succeeded.size())
                .failureCount(failed.size())
                .succeeded(succeeded)
                .failed(failed)
                .build();
    }

    // ── Update ───────────────────────────────────────────────────────────────

    @Caching(evict = {
            @CacheEvict(value = CacheConfig.PLACEMENT_BY_ID, key = "#placementId"),
            @CacheEvict(value = CacheConfig.PLACEMENTS_BY_PRN, allEntries = true),
            @CacheEvict(value = CacheConfig.PLACEMENTS_BY_SESSION, allEntries = true),
            @CacheEvict(value = CacheConfig.PLACEMENT_STATS_BY_SESSION, allEntries = true),
            @CacheEvict(value = CacheConfig.ALL_COMPANIES, allEntries = true),
            @CacheEvict(value = CacheConfig.COMPANIES_BY_SESSION, allEntries = true),
            @CacheEvict(value = CacheConfig.COMBINED_PACKAGES_BY_SESSION, allEntries = true),
            @CacheEvict(value = CacheConfig.COMPANY_OVERALL_STATS, allEntries = true)
    })
    @Transactional
    public PlacementResponse updatePlacement(
            Long placementId, PlacementRequest request, String prn, String role
    ) {

        if (notOfTnp(prn, role)) {
            throw new UnauthorizedException("You are not a member of TNP");
        }

        Placement placement = getPlacementOrThrow(placementId);

        if (!placement.getCompany().getCompanyId().equals(request.getCompanyId())) {
            Company newCompany = companyRepository.findById(request.getCompanyId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Company not found with id: " + request.getCompanyId()));

            if (placementRepository.existsByStudentPrnAndCompany_CompanyId(
                    request.getStudentPrn(), request.getCompanyId())) {
                throw new DuplicateResourceException(
                        "Placement already exists for PRN " + request.getStudentPrn()
                                + " with company id " + request.getCompanyId());
            }
            placement.setCompany(newCompany);
        }

        ProfileResponse profile;
        if (!placement.getStudentPrn().equals(request.getStudentPrn())) {
            profile = profileClient.getProfileByPrn(request.getStudentPrn());
            if (profile == null) {
                throw new ResourceNotFoundException(
                        "Student with PRN " + request.getStudentPrn() + " not found");
            }
            placement.setStudentPrn(request.getStudentPrn());
        } else {
            profile = profileClient.getProfileByPrn(placement.getStudentPrn());
        }

        placement.setRole(request.getRole());
        placement.setPackageOffered(request.getPackageOffered());

        placement = placementRepository.save(placement);
        log.info("Placement updated: id={}", placementId);

        return toResponse(placement, profile);
    }

    // ── Delete ───────────────────────────────────────────────────────────────

    @Caching(evict = {
            @CacheEvict(value = CacheConfig.PLACEMENT_BY_ID, key = "#placementId"),
            @CacheEvict(value = CacheConfig.PLACEMENTS_BY_PRN, allEntries = true),
            @CacheEvict(value = CacheConfig.PLACEMENTS_BY_SESSION, allEntries = true),
            @CacheEvict(value = CacheConfig.PLACEMENT_STATS_BY_SESSION, allEntries = true),
            @CacheEvict(value = CacheConfig.ALL_COMPANIES, allEntries = true),
            @CacheEvict(value = CacheConfig.COMPANIES_BY_SESSION, allEntries = true),
            @CacheEvict(value = CacheConfig.COMPANIES_BY_MIN_HIRED, allEntries = true),
            @CacheEvict(value = CacheConfig.COMBINED_PACKAGES_BY_SESSION, allEntries = true),
            @CacheEvict(value = CacheConfig.COMPANY_OVERALL_STATS, allEntries = true)
    })
    @Transactional
    public void deletePlacement(Long placementId, String prn, String role) {

        if (notOfTnp(prn, role)) {
            throw new UnauthorizedException("You are not a member of TNP");
        }

        Placement placement = getPlacementOrThrow(placementId);
        placementRepository.delete(placement);
        log.info("Placement deleted: id={}", placementId);
    }

    // Called internally by CompanyService.deleteRecord — no auth re-check needed here,
    // caller already validated. Evicts all placement caches since the whole company is gone.
    @Caching(evict = {
            @CacheEvict(value = CacheConfig.PLACEMENT_BY_ID, allEntries = true),
            @CacheEvict(value = CacheConfig.PLACEMENTS_BY_PRN, allEntries = true),
            @CacheEvict(value = CacheConfig.PLACEMENTS_BY_SESSION, allEntries = true),
            @CacheEvict(value = CacheConfig.PLACEMENT_STATS_BY_SESSION, allEntries = true),
            @CacheEvict(value = CacheConfig.COMPANY_OVERALL_STATS, allEntries = true)
    })
    @Transactional
    public void deletePlacementForCompany(Company company, String prn, String role) {

        List<Long> placementIds = placementRepository.findByCompany(company);
        if (notOfTnp(prn, role)) {
            throw new UnauthorizedException("You are not a member of TNP");
        }

        placementRepository.deleteAllByIdInBatch(placementIds);
        log.info("Placements deleted: ids={}", placementIds);
    }

    // ── Read: single ─────────────────────────────────────────────────────────

    // Auth-gated but the underlying data is stable between mutations — cache it.
    // The prn/role params are auth only and must NOT be part of the cache key.
    @Cacheable(value = CacheConfig.PLACEMENT_BY_ID, key = "#placementId")
    @Transactional(readOnly = true)
    public PlacementResponse getPlacementById(Long placementId, String prn, String role) {

        if (notOfTnp(prn, role)) {
            throw new UnauthorizedException("You are not a member of TNP");
        }

        log.info("Fetching placement by id: {} - Cache miss, loading from DB", placementId);
        Placement placement = getPlacementOrThrow(placementId);
        ProfileResponse profile = profileClient.getProfileByPrn(placement.getStudentPrn());
        return toResponse(placement, profile);
    }

    @Cacheable(value = CacheConfig.PLACEMENTS_BY_PRN, key = "#prn")
    @Transactional(readOnly = true)
    public List<PlacementResponse> getPlacementsByPrn(
            String prn, String requesterPrn, String role
    ) {

        if (notOfTnp(requesterPrn, role)) {
            throw new UnauthorizedException("You are not a member of TNP");
        }

        log.info("Fetching placements for PRN: {} - Cache miss, loading from DB", prn);
        List<Placement> placements = placementRepository.findByStudentPrn(prn);
        if (placements.isEmpty()) return List.of();

        ProfileResponse profile = profileClient.getProfileByPrn(prn);
        return placements.stream()
                .map(p -> toResponse(p, profile))
                .toList();
    }

    // ── Read: pageable ────────────────────────────────────────────────────────
    // Paginated reads are NOT cached — unbounded page/size keys, same policy as all other services.

    @Transactional(readOnly = true)
    public Page<PlacementResponse> getAllPlacements(Pageable pageable) {
        Page<Placement> page = placementRepository.findAllWithDetails(pageable);
        return enrichPageWithProfiles(page);
    }

    @Transactional(readOnly = true)
    public Page<PlacementResponse> getPlacementsByCompany(
            Long companyId, Pageable pageable, String prn, String role
    ) {
        if (notOfTnp(prn, role)) {
            throw new UnauthorizedException("You are not a member of TNP");
        }

        if (!companyRepository.existsById(companyId)) {
            throw new ResourceNotFoundException("Company not found with id: " + companyId);
        }
        Page<Placement> page = placementRepository.findByCompany_CompanyId(companyId, pageable);
        return enrichPageWithProfiles(page);
    }

    @Transactional(readOnly = true)
    public Page<PlacementResponse> getPlacementsBySession(String session, Pageable pageable) {
        Page<Placement> page = placementRepository.findByAcademicSession(session, pageable);
        return enrichPageWithProfiles(page);
    }

    @Transactional(readOnly = true)
    public Page<PlacementResponse> getPlacementsByRole(
            String role, Pageable pageable, String prn, String requesterRole
    ) {
        if (notOfTnp(prn, requesterRole)) {
            throw new UnauthorizedException("You are not a member of TNP");
        }
        Page<Placement> page = placementRepository.findByRole(role, pageable);
        return enrichPageWithProfiles(page);
    }

    @Transactional(readOnly = true)
    public Page<PlacementResponse> getPlacementsByIndustry(
            Long industryId, Pageable pageable, String prn, String role
    ) {
        if (notOfTnp(prn, role)) {
            throw new UnauthorizedException("You are not a member of TNP");
        }
        Page<Placement> page = placementRepository.findByIndustry(industryId, pageable);
        return enrichPageWithProfiles(page);
    }

    @Transactional(readOnly = true)
    public Page<PlacementResponse> getPlacementsByPackageRange(
            Double min, Double max, Pageable pageable, String prn, String role
    ) {
        if (notOfTnp(prn, role)) {
            throw new UnauthorizedException("You are not a member of TNP");
        }
        Page<Placement> page = placementRepository.findByPackageOfferedBetween(min, max, pageable);
        return enrichPageWithProfiles(page);
    }

    // ── Stats ────────────────────────────────────────────────────────────────

    @Cacheable(value = CacheConfig.PLACEMENT_STATS_BY_SESSION, key = "#session")
    @Transactional(readOnly = true)
    public PlacementStatsResponse getStatsBySession(String session, String prn, String role) {

        if (notOfTnp(prn, role)) {
            throw new UnauthorizedException("You are not a member of TNP");
        }

        log.info("Fetching placement stats for session: {} - Cache miss, loading from DB", session);
        return PlacementStatsResponse.builder()
                .academicSession(session)
                .totalPlacements(placementRepository.countByAcademicSession(session))
                .averagePackage(placementRepository.avgPackageByAcademicSession(session))
                .highestPackage(placementRepository.maxPackageByAcademicSession(session))
                .build();
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private Page<PlacementResponse> enrichPageWithProfiles(Page<Placement> page) {
        if (page.isEmpty()) return page.map(p -> toResponse(p, null));

        List<String> prns = page.stream()
                .map(Placement::getStudentPrn)
                .distinct()
                .toList();

        Map<String, ProfileResponse> profileMap = profileClient.getProfilesByPrns(prns)
                .stream()
                .collect(Collectors.toMap(ProfileResponse::getPrn, Function.identity()));

        return page.map(p -> toResponse(p, profileMap.get(p.getStudentPrn())));
    }

    private Placement getPlacementOrThrow(Long id) {
        return placementRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Placement not found with id: " + id));
    }

    private PlacementResponse toResponse(Placement p, ProfileResponse profile) {
        PlacementResponse.PlacementResponseBuilder builder = PlacementResponse.builder()
                .placementId(p.getPlacementId())
                .studentPrn(p.getStudentPrn())
                .companyId(p.getCompany().getCompanyId())
                .companyName(p.getCompany().getName())
                .industry(p.getCompany().getIndustry().getName())
                .academicSession(p.getCompany().getAcademicSession().getAcademicSession())
                .role(p.getRole())
                .packageOffered(p.getPackageOffered())
                .placedAt(p.getPlacedAt());

        if (profile != null) {
            builder.studentName(profile.getFullName())
                    .department(profile.getDepartment())
                    .year(profile.getYear())
                    .imageUrl(profile.getImageUrl());
        }

        return builder.build();
    }
}