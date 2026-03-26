package com.clubHouse.tnp.service;

import com.clubHouse.tnp.dto.request.AddCompanyRequest;
import com.clubHouse.tnp.dto.request.UpdateCompanyRequest;
import com.clubHouse.tnp.dto.response.CompanyResponse;
import com.clubHouse.tnp.dto.response.PagedResponse;
import com.clubHouse.tnp.exception.ResourceNotFoundException;
import com.clubHouse.tnp.exception.ServiceException;
import com.clubHouse.tnp.mapper.CompanyMapper;
import com.clubHouse.tnp.model.Company;
import com.clubHouse.tnp.model.Industry;
import com.clubHouse.tnp.model.VisitYear;
import com.clubHouse.tnp.repository.CompanyRepository;
import com.clubHouse.tnp.repository.IndustryRepository;
import com.clubHouse.tnp.repository.VisitYearRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class CompanyService {

    private final CompanyRepository companyRepository;
    private final IndustryRepository industryRepository;
    private final VisitYearRepository visitYearRepository;

    // ── Private resolvers ─────────────────────────────────────────────────────
    // Keep all FK lookups in one place so every method stays clean

    private Industry resolveIndustry(String name) {
        String sanitizedName = CompanyMapper.sanitizeIndustry(name);
        return industryRepository.findByName(sanitizedName)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Industry not found: " + sanitizedName
                ));
    }

    private VisitYear resolveAcademicSession(Integer year) {
        String academicSession = VisitYear.generateAcademicSession(year);
        return visitYearRepository.findByAcademicSession(academicSession)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Academic Session not found: " + academicSession));
    }

    // ── CREATE ────────────────────────────────────────────────────────────────

    public CompanyResponse addNewRecord(AddCompanyRequest req, String prn, String role) {
        log.info("Attempting to add new record for company: {}", req.getName());

        Industry industry = resolveIndustry(req.getIndustry());
        VisitYear academicSession = resolveAcademicSession(req.getAcademicSession());

        Company exists = companyRepository.findByNameAndPackageOfferedAndAcademicSession(
                req.getName(), req.getPackageOffered(), academicSession);

        if (exists != null) {
            log.info("Record already exists, returning existing record");
            return CompanyMapper.toResponse(exists);
        }

        Company company = Company.builder()
                .name(CompanyMapper.sanitizeCompanyName(req.getName()))
                .industry(industry)
                .packageOffered(req.getPackageOffered())
                .studentsHired(req.getStudentsHired())
                .academicSession(academicSession)
                .build();

        try {
            Company saved = companyRepository.save(company);
            log.info("Record saved successfully with id: {}", saved.getCompanyId());
            return CompanyMapper.toResponse(saved);
        } catch (Exception e) {
            throw new ServiceException("Not able to save record in db.");
        }
    }

    // ── READ ──────────────────────────────────────────────────────────────────

    public List<CompanyResponse> getAll() {
        log.info("Fetching all company records");
        return CompanyMapper.toResponseList(companyRepository.findAllByOrderByCreatedAtDesc());
    }

    public CompanyResponse getById(Long id) {
        log.info("Fetching company record by id: {}", id);
        return CompanyMapper.toResponse(
                companyRepository.findById(id)
                        .orElseThrow(() -> new ResourceNotFoundException(
                                "Company not found with id: " + id))
        );
    }

    public List<CompanyResponse> getByName(String name) {
        String sanitizedName = CompanyMapper.sanitizeCompanyName(name);
        log.info("Fetching company records by name: {}", name);
        return CompanyMapper.toResponseList(companyRepository.findByName(sanitizedName));
    }

    public List<CompanyResponse> getByIndustry(String industry) {
        String sanitizedName = CompanyMapper.sanitizeIndustry(industry);
        log.info("Fetching company records by industry: {}", industry);
        return CompanyMapper.toResponseList(companyRepository
                .findByIndustry(resolveIndustry(sanitizedName)));
    }

    public List<CompanyResponse> getByAcademicSession(Integer year) {
        VisitYear academicSession = resolveAcademicSession(year);
        log.info("Fetching company records by visit year: {}", academicSession.getAcademicSession());
        return CompanyMapper.toResponseList(companyRepository.findByAcademicSession(academicSession));
    }

    public List<CompanyResponse> getByPackageRange(Double min, Double max) {
        log.info("Fetching company records by package range: {} - {}", min, max);
        if (min > max) throw new ServiceException("Min package cannot be greater than max package.");
        return CompanyMapper.toResponseList(companyRepository.findByPackageRange(min, max));
    }

    public List<CompanyResponse> getByStudentsHired(Integer count) {
        log.info("Fetching company records by students hired: {}", count);
        return CompanyMapper.toResponseList(companyRepository.findByStudentsHired(count));
    }

    public List<CompanyResponse> getByMinStudentsHired(Integer minCount) {
        log.info("Fetching company records with at least {} students hired", minCount);
        return CompanyMapper.toResponseList(companyRepository
                .findByStudentsHiredGreaterThanEqual(minCount));
    }

    public List<CompanyResponse> getByAcademicSessionAndPackageRange(
            Integer year, Double min, Double max
    ) {
        VisitYear visitYear = resolveAcademicSession(year);
        log.info("Fetching company records for year: {}, package range: {} - {}",
                visitYear.getAcademicSession(), min, max);
        if (min > max) throw new ServiceException("Min package cannot be greater than max package.");
        return CompanyMapper.toResponseList(
                companyRepository.findByAcademicSessionAndPackageRange(visitYear, min, max));
    }

    public List<CompanyResponse> getByAcademicSessionAndIndustry(Integer year, String industry) {

        VisitYear visitYear = resolveAcademicSession(year);
        log.info("Fetching company records for year: {}, industry: {}",
                visitYear.getAcademicSession(), industry);

        return CompanyMapper.toResponseList(
                companyRepository.findByAcademicSessionAndIndustry(
                        visitYear,
                        resolveIndustry(industry)
                )
        );
    }

    public List<CompanyResponse> getByAcademicSessionAndStudentsHired(
            Integer year, Integer minHired
    ) {

        VisitYear visitYear = resolveAcademicSession(year);
        log.info("Fetching company records for year: {}, min students hired: {}",
                visitYear.getAcademicSession(), minHired);

        return CompanyMapper.toResponseList(
                companyRepository.findByAcademicSessionAndMinStudentsHired(
                        visitYear,
                        minHired
                )
        );
    }

    // ── UPDATE ────────────────────────────────────────────────────────────────

    public CompanyResponse updateRecord(
            Long id, UpdateCompanyRequest req, String prn, String role
    ) {
        log.info("Attempting to update company record with id: {}", id);

        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException
                        ("Company not found with id: " + id));

        if (req.getName() != null) company.setName(req.getName());
        if (req.getPackageOffered() != null) company.setPackageOffered(req.getPackageOffered());
        if (req.getStudentsHired() != null) company.setStudentsHired(req.getStudentsHired());
        if (req.getIndustry() != null) company.setIndustry(resolveIndustry(req.getIndustry()));
        if (req.getAcademicSession() != null) {
            company.setAcademicSession(resolveAcademicSession(req.getAcademicSession()));
        }

        try {
            Company updated = companyRepository.save(company);
            log.info("Record updated successfully for id: {}", id);
            return CompanyMapper.toResponse(updated);
        } catch (Exception e) {
            throw new ServiceException("Not able to update record in db.");
        }
    }

    // ── DELETE ────────────────────────────────────────────────────────────────

    public void deleteRecord(Long id, String prn, String role) {
        log.info("Attempting to delete company record with id: {}", id);

        if (!companyRepository.existsById(id)) {
            throw new ResourceNotFoundException("Company not found with id: " + id);
        }

        try {
            companyRepository.deleteById(id);
            log.info("Record deleted successfully for id: {}", id);
        } catch (Exception e) {
            throw new ServiceException("Not able to delete record from db.");
        }
    }

    // ── PAGED READS ───────────────────────────────────────────────────────────

    public PagedResponse<CompanyResponse> getAllPaged(int page, int size) {
        log.info("Fetching all company records - page: {}, size: {}", page, size);
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return PagedResponse.from(companyRepository.findAll(pageable)
                .map(CompanyMapper::toResponse));
    }

    public PagedResponse<CompanyResponse> getByNamePaged(String name, int page, int size) {
        log.info("Fetching company records by name: {} - page: {}, size: {}", name, page, size);
        Pageable pageable = PageRequest.of(page, size, Sort.by("name").ascending());
        return PagedResponse.from(
                companyRepository.findByNameContainingIgnoreCase(name, pageable)
                        .map(CompanyMapper::toResponse));
    }

    public PagedResponse<CompanyResponse> getByIndustryPaged(
            String industry, int page, int size
    ) {
        log.info("Fetching company records by industry: {} - page: {}, size: {}",
                industry, page, size);
        Pageable pageable = PageRequest.of(page, size, Sort.by("name").ascending());
        return PagedResponse.from(
                companyRepository.findByIndustry(resolveIndustry(industry), pageable)
                        .map(CompanyMapper::toResponse));
    }

    public PagedResponse<CompanyResponse> getByVisitYearPaged(
            Integer year, int page, int size
    ) {

        VisitYear visitYear = resolveAcademicSession(year);
        log.info("Fetching company records by visit year: {} - page: {}, size: {}",
                visitYear.getAcademicSession(), page, size);
        Pageable pageable = PageRequest.of(page, size, Sort.by("name").ascending());
        return PagedResponse.from(
                companyRepository.findByAcademicSession(visitYear, pageable)
                        .map(CompanyMapper::toResponse));
    }

    public PagedResponse<CompanyResponse> getByPackageRangePaged(
            Double min, Double max, int page, int size
    ) {
        log.info("Fetching company records by package range: {} - {} - page: {}, size: {}",
                min, max, page, size);
        if (min > max) throw new ServiceException("Min package cannot be greater than max package.");
        Pageable pageable = PageRequest.of(page, size);
        return PagedResponse.from(
                companyRepository.findByPackageRange(min, max, pageable)
                        .map(CompanyMapper::toResponse));
    }

    public PagedResponse<CompanyResponse> getByStudentsHiredPaged(
            Integer count, int page, int size
    ) {
        log.info("Fetching company records by students hired: {} - page: {}, size: {}",
                count, page, size);
        Pageable pageable = PageRequest.of(page, size, Sort.by("name").ascending());
        return PagedResponse.from(
                companyRepository.findByStudentsHired(count, pageable)
                        .map(CompanyMapper::toResponse));
    }

    public PagedResponse<CompanyResponse> getByMinStudentsHiredPaged(
            Integer minCount, int page, int size
    ) {
        log.info("Fetching company records with min students hired: {} - page: {}, size: {}",
                minCount, page, size);
        Pageable pageable = PageRequest.of(page, size, Sort.by("studentsHired").descending());
        return PagedResponse.from(
                companyRepository.findByStudentsHiredGreaterThanEqual(minCount, pageable)
                        .map(CompanyMapper::toResponse));
    }

    public PagedResponse<CompanyResponse> getByVisitYearAndPackageRangePaged(
            Integer year, Double min, Double max, int page, int size
    ) {

        VisitYear visitYear = resolveAcademicSession(year);
        log.info("Fetching company records by year: {}, package: {} - {} - page: {}, size: {}",
                visitYear.getAcademicSession(), min, max, page, size);
        if (min > max) throw new ServiceException("Min package cannot be greater than max package.");
        Pageable pageable = PageRequest.of(page, size);
        return PagedResponse.from(
                companyRepository.findByAcademicSessionAndPackageRange(
                                visitYear,
                                min,
                                max,
                                pageable
                        )
                        .map(CompanyMapper::toResponse));
    }

    public PagedResponse<CompanyResponse> getByVisitYearAndIndustryPaged(
            Integer year, String industry, int page, int size
    ) {

        VisitYear visitYear = resolveAcademicSession(year);
        log.info("Fetching company records by year: {}, industry: {} - page: {}, size: {}",
                visitYear.getAcademicSession(), industry, page, size);
        Pageable pageable = PageRequest.of(page, size, Sort.by("name").ascending());
        return PagedResponse.from(
                companyRepository.findByAcademicSessionAndIndustry(
                        visitYear,
                        resolveIndustry(industry),
                        pageable
                ).map(CompanyMapper::toResponse)
        );
    }

    public PagedResponse<CompanyResponse> getByVisitYearAndStudentsHiredPaged(
            Integer year, Integer minHired, int page, int size
    ) {

        VisitYear visitYear = resolveAcademicSession(year);
        log.info("Fetching company records by year: {}, min hired: {} - page: {}, size: {}",
                visitYear.getAcademicSession(), minHired, page, size);
        Pageable pageable = PageRequest.of(page, size);
        return PagedResponse.from(
                companyRepository.findByAcademicSessionAndMinStudentsHired(
                        visitYear,
                        minHired,
                        pageable
                ).map(CompanyMapper::toResponse)
        );
    }
}