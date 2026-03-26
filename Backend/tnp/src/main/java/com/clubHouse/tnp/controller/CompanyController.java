package com.clubHouse.tnp.controller;

import com.clubHouse.tnp.dto.ApiResponse;
import com.clubHouse.tnp.dto.request.AddCompanyRequest;
import com.clubHouse.tnp.dto.request.UpdateCompanyRequest;
import com.clubHouse.tnp.dto.response.CompanyResponse;
import com.clubHouse.tnp.dto.response.PagedResponse;
import com.clubHouse.tnp.service.CompanyService;
import com.clubHouse.tnp.service.JwtService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/company")
public class CompanyController {

    private final CompanyService companyService;
    private final JwtService jwtService;

    private String prn(HttpServletRequest r)  { return jwtService.extractPrnFromHeaders(r); }
    private String role(HttpServletRequest r) { return jwtService.extractRoleFromHeaders(r); }

    // ── CREATE ────────────────────────────────────────────────────────────────

    /** POST /api/company/add */
    @PostMapping("/add")
    public ResponseEntity<ApiResponse<CompanyResponse>> addCompany(
            @RequestBody AddCompanyRequest req,
            HttpServletRequest httpReq
    ) {
        log.info("Request received to add new company record");
        CompanyResponse resp = companyService.addNewRecord(req, prn(httpReq), role(httpReq));
        return ResponseEntity.ok(ApiResponse.success("Record added successfully", resp));
    }

    // ── READ ──────────────────────────────────────────────────────────────────

    /** GET /api/company/all */
    @GetMapping("/all")
    public ResponseEntity<ApiResponse<List<CompanyResponse>>> getAll() {
        log.info("Request received to fetch all company records");
        return ResponseEntity.ok(ApiResponse.success("Records fetched successfully", companyService.getAll()));
    }

    /** GET /api/company/{id} */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CompanyResponse>> getById(@PathVariable Long id) {
        log.info("Request received to fetch company record by id: {}", id);
        return ResponseEntity.ok(ApiResponse.success("Record fetched successfully", companyService.getById(id)));
    }

    /** GET /api/company/search/name?name=TCS */
    @GetMapping("/search/name")
    public ResponseEntity<ApiResponse<List<CompanyResponse>>> getByName(
            @RequestParam String name
    ) {
        log.info("Request received to search company records by name: {}", name);
        return ResponseEntity.ok(ApiResponse.success("Records fetched successfully", companyService.getByName(name)));
    }

    /** GET /api/company/search/industry?industry=it-services */
    @GetMapping("/search/industry")
    public ResponseEntity<ApiResponse<List<CompanyResponse>>> getByIndustry(
            @RequestParam String industry
    ) {
        log.info("Request received to fetch company records by industry: {}", industry);
        return ResponseEntity.ok(ApiResponse.success("Records fetched successfully", companyService.getByIndustry(industry)));
    }

    /** GET /api/company/search/year?year=2025 */
    @GetMapping("/search/year")
    public ResponseEntity<ApiResponse<List<CompanyResponse>>> getByVisitYear(
            @RequestParam Integer year
    ) {
        log.info("Request received to fetch company records by visit year: {}", year);
        return ResponseEntity.ok(ApiResponse.success("Records fetched successfully", companyService.getByAcademicSession(year)));
    }

    /** GET /api/company/search/package?min=5.0&max=20.0 */
    @GetMapping("/search/package")
    public ResponseEntity<ApiResponse<List<CompanyResponse>>> getByPackageRange(
            @RequestParam Double min,
            @RequestParam Double max
    ) {
        log.info("Request received to fetch company records by package range: {} - {}", min, max);
        return ResponseEntity.ok(ApiResponse.success("Records fetched successfully", companyService.getByPackageRange(min, max)));
    }

    /** GET /api/company/search/hired?count=50 — exact match */
    @GetMapping("/search/hired")
    public ResponseEntity<ApiResponse<List<CompanyResponse>>> getByStudentsHired(
            @RequestParam Integer count
    ) {
        log.info("Request received to fetch company records by students hired: {}", count);
        return ResponseEntity.ok(ApiResponse.success("Records fetched successfully", companyService.getByStudentsHired(count)));
    }

    /** GET /api/company/search/hired/min?count=30 — hired >= count */
    @GetMapping("/search/hired/min")
    public ResponseEntity<ApiResponse<List<CompanyResponse>>> getByMinStudentsHired(
            @RequestParam Integer count
    ) {
        log.info("Request received to fetch company records with min students hired: {}", count);
        return ResponseEntity.ok(ApiResponse.success("Records fetched successfully", companyService.getByMinStudentsHired(count)));
    }

    /** GET /api/company/search/year-package?year=2025&min=5.0&max=20.0 */
    @GetMapping("/search/year-package")
    public ResponseEntity<ApiResponse<List<CompanyResponse>>> getByVisitYearAndPackage(
            @RequestParam Integer year,
            @RequestParam Double min,
            @RequestParam Double max
    ) {
        log.info("Request received to fetch company records by year: {} and package range: {} - {}", year, min, max);
        return ResponseEntity.ok(ApiResponse.success("Records fetched successfully",
                companyService.getByAcademicSessionAndPackageRange(year, min, max)));
    }

    /** GET /api/company/search/year-industry?year=2025&industry=consulting */
    @GetMapping("/search/year-industry")
    public ResponseEntity<ApiResponse<List<CompanyResponse>>> getByVisitYearAndIndustry(
            @RequestParam Integer year,
            @RequestParam String industry
    ) {
        log.info("Request received to fetch company records by year: {} and industry: {}", year, industry);
        return ResponseEntity.ok(ApiResponse.success("Records fetched successfully",
                companyService.getByAcademicSessionAndIndustry(year, industry)));
    }

    /** GET /api/company/search/year-hired?year=2025&minHired=30 */
    @GetMapping("/search/year-hired")
    public ResponseEntity<ApiResponse<List<CompanyResponse>>> getByVisitYearAndStudentsHired(
            @RequestParam Integer year,
            @RequestParam Integer minHired
    ) {
        log.info("Request received to fetch company records by year: {} and min students hired: {}", year, minHired);
        return ResponseEntity.ok(ApiResponse.success("Records fetched successfully",
                companyService.getByAcademicSessionAndStudentsHired(year, minHired)));
    }

    // ── UPDATE ────────────────────────────────────────────────────────────────

    /** PATCH /api/company/{id} */
    @PatchMapping("/{id}")
    public ResponseEntity<ApiResponse<CompanyResponse>> updateCompany(
            @PathVariable Long id,
            @RequestBody UpdateCompanyRequest req,
            HttpServletRequest httpReq
    ) {
        log.info("Request received to update company record with id: {}", id);
        CompanyResponse resp = companyService.updateRecord(id, req, prn(httpReq), role(httpReq));
        return ResponseEntity.ok(ApiResponse.success("Record updated successfully", resp));
    }

    // ── DELETE ────────────────────────────────────────────────────────────────

    /** DELETE /api/company/{id} */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCompany(
            @PathVariable Long id,
            HttpServletRequest httpReq
    ) {
        log.info("Request received to delete company record with id: {}", id);
        companyService.deleteRecord(id, prn(httpReq), role(httpReq));
        return ResponseEntity.ok(ApiResponse.success("Record deleted successfully", null));
    }

    // ── PAGED READS ───────────────────────────────────────────────────────────────

    /** GET /api/company/paged/all?page=0&size=10 */
    @GetMapping("/paged/all")
    public ResponseEntity<ApiResponse<PagedResponse<CompanyResponse>>> getAllPaged(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        log.info("Paged request to fetch all company records - page: {}, size: {}", page, size);
        return ResponseEntity.ok(ApiResponse.success("Records fetched successfully",
                companyService.getAllPaged(page, size)));
    }

    /** GET /api/company/paged/search/name?name=TCS&page=0&size=10 */
    @GetMapping("/paged/search/name")
    public ResponseEntity<ApiResponse<PagedResponse<CompanyResponse>>> getByNamePaged(
            @RequestParam String name,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        log.info("Paged request to search company records by name: {}", name);
        return ResponseEntity.ok(ApiResponse.success("Records fetched successfully",
                companyService.getByNamePaged(name, page, size)));
    }

    /** GET /api/company/paged/search/industry?industry=consulting&page=0&size=10 */
    @GetMapping("/paged/search/industry")
    public ResponseEntity<ApiResponse<PagedResponse<CompanyResponse>>> getByIndustryPaged(
            @RequestParam String industry,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        log.info("Paged request to fetch company records by industry: {}", industry);
        return ResponseEntity.ok(ApiResponse.success("Records fetched successfully",
                companyService.getByIndustryPaged(industry, page, size)));
    }

    /** GET /api/company/paged/search/year?year=2025&page=0&size=10 */
    @GetMapping("/paged/search/year")
    public ResponseEntity<ApiResponse<PagedResponse<CompanyResponse>>> getByVisitYearPaged(
            @RequestParam Integer year,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        log.info("Paged request to fetch company records by visit year: {}", year);
        return ResponseEntity.ok(ApiResponse.success("Records fetched successfully",
                companyService.getByVisitYearPaged(year, page, size)));
    }

    /** GET /api/company/paged/search/package?min=5.0&max=20.0&page=0&size=10 */
    @GetMapping("/paged/search/package")
    public ResponseEntity<ApiResponse<PagedResponse<CompanyResponse>>> getByPackageRangePaged(
            @RequestParam Double min,
            @RequestParam Double max,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        log.info("Paged request to fetch company records by package range: {} - {}", min, max);
        return ResponseEntity.ok(ApiResponse.success("Records fetched successfully",
                companyService.getByPackageRangePaged(min, max, page, size)));
    }

    /** GET /api/company/paged/search/hired?count=50&page=0&size=10 */
    @GetMapping("/paged/search/hired")
    public ResponseEntity<ApiResponse<PagedResponse<CompanyResponse>>> getByStudentsHiredPaged(
            @RequestParam Integer count,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        log.info("Paged request to fetch company records by students hired: {}", count);
        return ResponseEntity.ok(ApiResponse.success("Records fetched successfully",
                companyService.getByStudentsHiredPaged(count, page, size)));
    }

    /** GET /api/company/paged/search/hired/min?count=30&page=0&size=10 */
    @GetMapping("/paged/search/hired/min")
    public ResponseEntity<ApiResponse<PagedResponse<CompanyResponse>>> getByMinStudentsHiredPaged(
            @RequestParam Integer count,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        log.info("Paged request to fetch company records with min students hired: {}", count);
        return ResponseEntity.ok(ApiResponse.success("Records fetched successfully",
                companyService.getByMinStudentsHiredPaged(count, page, size)));
    }

    /** GET /api/company/paged/search/year-package?year=2025&min=5.0&max=20.0&page=0&size=10 */
    @GetMapping("/paged/search/year-package")
    public ResponseEntity<ApiResponse<PagedResponse<CompanyResponse>>> getByVisitYearAndPackagePaged(
            @RequestParam Integer year,
            @RequestParam Double min,
            @RequestParam Double max,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        log.info("Paged request to fetch company records by year: {} and package: {} - {}", year, min, max);
        return ResponseEntity.ok(ApiResponse.success("Records fetched successfully",
                companyService.getByVisitYearAndPackageRangePaged(year, min, max, page, size)));
    }

    /** GET /api/company/paged/search/year-industry?year=2025&industry=consulting&page=0&size=10 */
    @GetMapping("/paged/search/year-industry")
    public ResponseEntity<ApiResponse<PagedResponse<CompanyResponse>>> getByVisitYearAndIndustryPaged(
            @RequestParam Integer year,
            @RequestParam String industry,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        log.info("Paged request to fetch company records by year: {} and industry: {}", year, industry);
        return ResponseEntity.ok(ApiResponse.success("Records fetched successfully",
                companyService.getByVisitYearAndIndustryPaged(year, industry, page, size)));
    }

    /** GET /api/company/paged/search/year-hired?year=2025&minHired=30&page=0&size=10 */
    @GetMapping("/paged/search/year-hired")
    public ResponseEntity<ApiResponse<PagedResponse<CompanyResponse>>> getByVisitYearAndStudentsHiredPaged(
            @RequestParam Integer year,
            @RequestParam Integer minHired,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        log.info("Paged request to fetch company records by year: {} and min hired: {}", year, minHired);
        return ResponseEntity.ok(ApiResponse.success("Records fetched successfully",
                companyService.getByVisitYearAndStudentsHiredPaged(year, minHired, page, size)));
    }
}