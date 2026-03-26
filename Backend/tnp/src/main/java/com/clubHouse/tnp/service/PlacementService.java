package com.clubHouse.tnp.service;

import com.clubHouse.tnp.client.ProfileManagementServiceClient;
import com.clubHouse.tnp.dto.request.PlacementRequest;
import com.clubHouse.tnp.dto.response.PlacementResponse;
import com.clubHouse.tnp.dto.response.PlacementStatsResponse;
import com.clubHouse.tnp.dto.response.ProfileResponse;
import com.clubHouse.tnp.exception.DuplicateResourceException;
import com.clubHouse.tnp.exception.ResourceNotFoundException;
import com.clubHouse.tnp.model.Company;
import com.clubHouse.tnp.model.Placement;
import com.clubHouse.tnp.repository.CompanyRepository;
import com.clubHouse.tnp.repository.PlacementRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
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

    // ── Create ───────────────────────────────────────────────────────────────

    @Transactional
    public PlacementResponse createPlacement(PlacementRequest request) {

        // 1. Validate student PRN exists in profile-service
        ProfileResponse profile = profileClient.getProfileByPrn(request.getStudentPrn());
        if (profile == null) {
            throw new ResourceNotFoundException(
                    "Student with PRN " + request.getStudentPrn() + " not found");
        }

        // 2. Validate company exists
        Company company = companyRepository.findById(request.getCompanyId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Company not found with id: " + request.getCompanyId()));

        // 3. Prevent duplicate placement for same student + company
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

    // ── Update ───────────────────────────────────────────────────────────────

    @Transactional
    public PlacementResponse updatePlacement(Long placementId, PlacementRequest request) {

        Placement placement = getPlacementOrThrow(placementId);

        // If company changed, re-validate and check for duplicate
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

        // If PRN changed, re-validate
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

    @Transactional
    public void deletePlacement(Long placementId) {
        Placement placement = getPlacementOrThrow(placementId);
        placementRepository.delete(placement);
        log.info("Placement deleted: id={}", placementId);
    }

    // ── Read: single ─────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public PlacementResponse getPlacementById(Long placementId) {
        Placement placement = getPlacementOrThrow(placementId);
        ProfileResponse profile = profileClient.getProfileByPrn(placement.getStudentPrn());
        return toResponse(placement, profile);
    }

    // ── Read: by student PRN (returns list – one student can have multiple placements) ──

    @Transactional(readOnly = true)
    public List<PlacementResponse> getPlacementsByPrn(String prn) {
        List<Placement> placements = placementRepository.findByStudentPrn(prn);
        if (placements.isEmpty()) return List.of();

        ProfileResponse profile = profileClient.getProfileByPrn(prn);
        return placements.stream()
                .map(p -> toResponse(p, profile))
                .toList();
    }

    // ── Read: pageable – all ─────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public Page<PlacementResponse> getAllPlacements(Pageable pageable) {
        Page<Placement> page = placementRepository.findAllWithDetails(pageable);
        return enrichPageWithProfiles(page);
    }

    // ── Read: pageable – by company ──────────────────────────────────────────

    @Transactional(readOnly = true)
    public Page<PlacementResponse> getPlacementsByCompany(Long companyId, Pageable pageable) {
        if (!companyRepository.existsById(companyId)) {
            throw new ResourceNotFoundException("Company not found with id: " + companyId);
        }
        Page<Placement> page = placementRepository.findByCompany_CompanyId(companyId, pageable);
        return enrichPageWithProfiles(page);
    }

    // ── Read: pageable – by academic session ─────────────────────────────────

    @Transactional(readOnly = true)
    public Page<PlacementResponse> getPlacementsBySession(String session, Pageable pageable) {
        Page<Placement> page = placementRepository.findByAcademicSession(session, pageable);
        return enrichPageWithProfiles(page);
    }

    // ── Read: pageable – by role ─────────────────────────────────────────────

    @Transactional(readOnly = true)
    public Page<PlacementResponse> getPlacementsByRole(String role, Pageable pageable) {
        Page<Placement> page = placementRepository.findByRole(role, pageable);
        return enrichPageWithProfiles(page);
    }

    // ── Read: pageable – by industry ─────────────────────────────────────────

    @Transactional(readOnly = true)
    public Page<PlacementResponse> getPlacementsByIndustry(Long industryId, Pageable pageable) {
        Page<Placement> page = placementRepository.findByIndustry(industryId, pageable);
        return enrichPageWithProfiles(page);
    }

    // ── Read: pageable – by package range ────────────────────────────────────

    @Transactional(readOnly = true)
    public Page<PlacementResponse> getPlacementsByPackageRange(
            Double min, Double max, Pageable pageable) {
        Page<Placement> page = placementRepository.findByPackageOfferedBetween(min, max, pageable);
        return enrichPageWithProfiles(page);
    }

    // ── Stats ────────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public PlacementStatsResponse getStatsBySession(String session) {
        return PlacementStatsResponse.builder()
                .academicSession(session)
                .totalPlacements(placementRepository.countByAcademicSession(session))
                .averagePackage(placementRepository.avgPackageByAcademicSession(session))
                .highestPackage(placementRepository.maxPackageByAcademicSession(session))
                .build();
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    /**
     * Bulk-fetches all profiles for a page in ONE external call, then maps
     * each placement to its profile via a PRN→profile lookup map.
     * This keeps the page-level cost to O(1) external calls regardless of page size.
     */
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
                   .year(profile.getYear());
        }

        return builder.build();
    }
}