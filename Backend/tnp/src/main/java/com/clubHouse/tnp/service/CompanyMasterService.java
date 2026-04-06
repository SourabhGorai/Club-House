package com.clubHouse.tnp.service;

import com.clubHouse.tnp.config.CacheConfig;
import com.clubHouse.tnp.dto.request.CompanyMasterRequest;
import com.clubHouse.tnp.dto.response.BulkCompanyMasterResponse;
import com.clubHouse.tnp.dto.response.CompanyMasterResponse;
import com.clubHouse.tnp.exception.ServiceException;
import com.clubHouse.tnp.exception.UnauthorizedException;
import com.clubHouse.tnp.mapper.CompanyMasterMapper;
import com.clubHouse.tnp.model.*;
import com.clubHouse.tnp.repository.CompanyMasterRepository;
import com.clubHouse.tnp.repository.CompanyRepository;
import com.clubHouse.tnp.repository.IndustryRepository;
import com.clubHouse.tnp.repository.TnpRepository;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.NotFoundException;
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
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class CompanyMasterService {

    private final CompanyMasterRepository companyMasterRepository;
    private final TnpRepository tnpRepository;
    private final IndustryRepository industryRepository;
    private final CompanyRepository companyRepository;

    // ── Private Methods ───────────────────────────────────────────────────────────

    private boolean isAuthorize(String prn, String role) {
        if (role.equals("SUPER_ADMIN")) return true;
        Tnp user = tnpRepository.findByPrnAndIsActiveTrue(prn);
        return user != null;
    }

    private boolean canDelete(String prn, String role) {
        if (role.equals("SUPER_ADMIN")) return true;
        Tnp user = tnpRepository.findByPrnAndIsActiveTrue(prn);
        if (user == null) return false;
        TnpRoles userRole = user.getRole();
        return userRole == TnpRoles.TNP_HEAD ||
                userRole == TnpRoles.PRESIDENT ||
                userRole == TnpRoles.VICE_PRESIDENT;
    }

    // ── Public Methods ───────────────────────────────────────────────────────────

    @Caching(evict = {
            @CacheEvict(value = CacheConfig.ALL_COMPANY_MASTERS, allEntries = true),
            @CacheEvict(value = CacheConfig.COMPANY_MASTERS_BY_INDUSTRY, allEntries = true)
    })
    @Transactional
    public CompanyMasterResponse addCompany(CompanyMasterRequest req, String prn, String role) {

        log.info("Attempting to add a company to the master company db");

        if (!isAuthorize(prn, role)) {
            throw new UnauthorizedException("You are unauthorized to do this operation" +
                    ", please contact TNP Cell");
        }

        String sanitizedName = CompanyMasterMapper.sanitizeCompanyName(req.getName());

        CompanyMaster exists = companyMasterRepository.findByName(sanitizedName);
        if (exists != null) {
            log.info("Company already exits");
            return CompanyMasterMapper.toResponse(exists);
        }

        Industry industry = industryRepository.findById(req.getIndustryId()).orElseThrow(
                () -> new NotFoundException(
                        String.format("Failed to fetch Industry with ID: %d", req.getIndustryId())
                )
        );

        try {
            CompanyMaster saved = companyMasterRepository.save(
                    CompanyMaster.builder()
                            .name(req.getName())
                            .industry(industry)
                            .logoUrl(req.getLogoUrl())
                            .build()
            );

            log.info("Data saved in db successfully");
            return CompanyMasterMapper.toResponse(saved);

        } catch (Exception e) {
            throw new RuntimeException("Failed to save in db");
        }
    }

    @Caching(evict = {
            @CacheEvict(value = CacheConfig.ALL_COMPANY_MASTERS, allEntries = true),
            @CacheEvict(value = CacheConfig.COMPANY_MASTERS_BY_INDUSTRY, allEntries = true)
    })
    @Transactional
    public BulkCompanyMasterResponse addCompanyBulk(
            List<CompanyMasterRequest> requests,
            String prn,
            String role
    ) {

        log.info("Attempting bulk insert into company master");

        if (!isAuthorize(prn, role)) {
            throw new UnauthorizedException(
                    "You are unauthorized to do this operation, please contact TNP Cell"
            );
        }

        if (requests == null || requests.isEmpty()) {
            throw new ServiceException("Request list cannot be empty");
        }

        List<CompanyMasterResponse> successList = new ArrayList<>();
        List<BulkCompanyMasterResponse.FailedCompany> failedList = new ArrayList<>();

        // ✅ 1. Deduplicate input (by sanitized name)
        Map<String, CompanyMasterRequest> uniqueRequests = new LinkedHashMap<>();

        for (CompanyMasterRequest req : requests) {
            if (req.getName() == null || req.getName().trim().isEmpty()) {
                failedList.add(
                        BulkCompanyMasterResponse.FailedCompany.builder()
                                .name(null)
                                .reason("Company name is required")
                                .build()
                );
                continue;
            }

            String sanitized = CompanyMasterMapper.sanitizeCompanyName(req.getName());
            uniqueRequests.putIfAbsent(sanitized, req);
        }

        // ✅ 2. Fetch existing companies in ONE query
        Set<String> names = uniqueRequests.keySet();

        Map<String, CompanyMaster> existingMap =
                companyMasterRepository.findByNameIn(names)
                        .stream()
                        .collect(Collectors.toMap(
                                CompanyMaster::getName,
                                c -> c
                        ));

        // ✅ 3. Fetch all industries in ONE query
        Set<Long> industryIds = uniqueRequests.values().stream()
                .map(CompanyMasterRequest::getIndustryId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        Map<Long, Industry> industryMap =
                industryRepository.findAllById(industryIds)
                        .stream()
                        .collect(Collectors.toMap(
                                Industry::getIndustryId,
                                i -> i
                        ));

        // ✅ 4. Prepare batch save list
        List<CompanyMaster> companiesToSave = new ArrayList<>();

        for (Map.Entry<String, CompanyMasterRequest> entry : uniqueRequests.entrySet()) {

            String sanitizedName = entry.getKey();
            CompanyMasterRequest req = entry.getValue();

            try {
                if (existingMap.containsKey(sanitizedName)) {
                    successList.add(CompanyMasterMapper.toResponse(existingMap.get(sanitizedName)));
                    continue;
                }

                Industry industry = industryMap.get(req.getIndustryId());
                if (industry == null) {
                    failedList.add(
                            BulkCompanyMasterResponse.FailedCompany.builder()
                                    .name(req.getName())
                                    .reason("Invalid industryId: " + req.getIndustryId())
                                    .build()
                    );
                    continue;
                }

                CompanyMaster company = CompanyMaster.builder()
                        .name(req.getName())
                        .industry(industry)
                        .logoUrl(req.getLogoUrl())
                        .build();

                companiesToSave.add(company);

            } catch (Exception e) {
                log.error("Failed to process company: {}", req.getName(), e);
                failedList.add(
                        BulkCompanyMasterResponse.FailedCompany.builder()
                                .name(req.getName())
                                .reason(e.getMessage())
                                .build()
                );
            }
        }

        // ✅ 5. Batch save (single DB hit)
        if (!companiesToSave.isEmpty()) {
            List<CompanyMaster> savedCompanies = companyMasterRepository.saveAll(companiesToSave);
            successList.addAll(
                    savedCompanies.stream()
                            .map(CompanyMasterMapper::toResponse)
                            .toList()
            );
        }

        log.info("Bulk insert completed. Success: {}, Failed: {}",
                successList.size(), failedList.size());

        return BulkCompanyMasterResponse.builder()
                .success(successList)
                .failed(failedList)
                .build();
    }

    @Cacheable(value = CacheConfig.ALL_COMPANY_MASTERS)
    public List<CompanyMasterResponse> getAllCompanies() {

        log.info("Fetching all companies from master - Cache miss, loading from DB");

        List<CompanyMaster> companies =
                companyMasterRepository.findAll(Sort.by(Sort.Direction.ASC, "name"));

        return companies.stream()
                .map(CompanyMasterMapper::toResponse)
                .toList();
    }

    // NOTE: Pagination results are NOT cached — page/size params make key management complex
    //       and pages go stale quickly. Cache the underlying data instead.
    public Page<CompanyMasterResponse> getAllCompanies(int page, int size) {

        log.info("Fetching all companies from master with pagination");

        Pageable pageable = PageRequest.of(page, size, Sort.by("name").ascending());

        Page<CompanyMaster> companies = companyMasterRepository.findAll(pageable);

        return companies.map(CompanyMasterMapper::toResponse);
    }

    @Caching(evict = {
            @CacheEvict(value = CacheConfig.COMPANY_MASTER_BY_ID, key = "#companyId"),
            @CacheEvict(value = CacheConfig.ALL_COMPANY_MASTERS, allEntries = true),
            @CacheEvict(value = CacheConfig.COMPANY_MASTERS_BY_INDUSTRY, allEntries = true)
    })
    @Transactional
    public CompanyMasterResponse updateCompany(
            Long companyId,
            CompanyMasterRequest req,
            String prn,
            String role
    ) {

        log.info("Attempting to update company with id: {}", companyId);

        if (!isAuthorize(prn, role)) {
            throw new UnauthorizedException(
                    "You are unauthorized to do this operation, please contact TNP Cell"
            );
        }

        CompanyMaster company = companyMasterRepository.findById(companyId)
                .orElseThrow(() ->
                        new NotFoundException("Company not found with id: " + companyId)
                );

        String sanitizedName = CompanyMasterMapper.sanitizeCompanyName(req.getName());
        CompanyMaster existing = companyMasterRepository.findByName(sanitizedName);

        if (existing != null && !existing.getCompanyMasterId().equals(companyId)) {
            throw new ServiceException("Company with same name already exists");
        }

        if (req.getName() != null) company.setName(req.getName());
        if (req.getLogoUrl() != null) company.setLogoUrl(req.getLogoUrl());

        if (req.getIndustryId() != null) {
            Industry industry = industryRepository.findById(req.getIndustryId())
                    .orElseThrow(() ->
                            new NotFoundException("Industry not found: " + req.getIndustryId())
                    );
            company.setIndustry(industry);
        }

        CompanyMaster updated = companyMasterRepository.save(company);

        log.info("Company updated successfully");

        return CompanyMasterMapper.toResponse(updated);
    }

    @Caching(evict = {
            @CacheEvict(value = CacheConfig.COMPANY_MASTER_BY_ID, key = "#companyId"),
            @CacheEvict(value = CacheConfig.ALL_COMPANY_MASTERS, allEntries = true),
            @CacheEvict(value = CacheConfig.COMPANY_MASTERS_BY_INDUSTRY, allEntries = true)
    })
    @Transactional
    public void deleteCompany(Long companyId, String prn, String role) {

        log.info("Attempting to delete company with id: {}", companyId);

        if (!canDelete(prn, role)) {
            throw new UnauthorizedException(
                    "You are unauthorized to do this operation, please contact TNP Cell"
            );
        }

        CompanyMaster companyMaster = companyMasterRepository.findById(companyId)
                .orElseThrow(() ->
                        new NotFoundException("Company not found with id: " + companyId)
                );

        List<Company> company = companyRepository.findByName(companyMaster.getName());
        if (!company.isEmpty()) {
            throw new ServiceException("You need to delete records from Company db first");
        }

        try {
            companyMasterRepository.delete(companyMaster);
            log.info("Company deleted successfully");

        } catch (Exception e) {
            log.error("Failed to delete company", e);
            throw new ServiceException("Failed to delete company. It may be in use.");
        }
    }
}