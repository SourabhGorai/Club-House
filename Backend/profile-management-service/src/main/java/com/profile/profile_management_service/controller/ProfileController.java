package com.profile.profile_management_service.controller;

import com.profile.profile_management_service.dto.*;
import com.profile.profile_management_service.service.ProfileService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * REST Controller for Profile Management
 * Provides endpoints for all profile operations with proper security
 */
@RestController
@RequestMapping("/api/profiles")
@RequiredArgsConstructor
@Slf4j
@Validated
public class ProfileController {

    private final ProfileService profileService;

    // ========== Core CRUD Endpoints ==========

    /**
     * Create a new user profile
     * POST /api/profiles
     */
    @PostMapping
    public ResponseEntity<ApiResponse<ProfileResponse>> createProfile(
            @Valid @RequestBody ProfileCreateRequest request) {
        log.info("Received request to create profile for PRN: {}", request.getPrn());

        ProfileResponse response = profileService.createProfile(request);
        log.info("Profile created successfully for PRN: {}", request.getPrn());

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Profile created successfully", response));
    }

    /**
     * Get profile by PRN
     * GET /api/profiles/prn/{prn}
     */
    @GetMapping("/prn/{prn}")
    public ResponseEntity<ApiResponse<ProfileResponse>> getProfileByPrn(
            @PathVariable String prn) {
        log.info("Received request to get profile by PRN: {}", prn);

        ProfileResponse response = profileService.getProfileByPrn(prn);
        log.info("Profile retrieved successfully for PRN: {}", prn);

        return ResponseEntity.ok(ApiResponse.success("Profile retrieved successfully", response));
    }

    /**
     * Get profile by User ID
     * GET /api/profiles/user/{userId}
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<ProfileResponse>> getProfileByUserId(
            @PathVariable Long userId) {
        log.info("Received request to get profile by UserId: {}", userId);

        ProfileResponse response = profileService.getProfileByUserId(userId);
        log.info("Profile retrieved successfully for UserId: {}", userId);

        return ResponseEntity.ok(ApiResponse.success("Profile retrieved successfully", response));
    }

    /**
     * Update profile
     * PUT /api/profiles/{prn}
     */
    @PutMapping("/{prn}")
    public ResponseEntity<ApiResponse<ProfileResponse>> updateProfile(
            @PathVariable String prn,
            @Valid @RequestBody ProfileUpdateRequest request) {
        log.info("Received request to update profile for PRN: {}", prn);

        ProfileResponse response = profileService.updateProfile(prn, request);
        log.info("Profile updated successfully for PRN: {}", prn);

        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", response));
    }

    /**
     * Delete profile (soft delete)
     * DELETE /api/profiles/{prn}
     */
    @DeleteMapping("/{prn}")
    public ResponseEntity<ApiResponse<Void>> deleteProfile(@PathVariable String prn) {
        log.info("Received request to delete profile for PRN: {}", prn);

        profileService.deleteProfile(prn);
        log.info("Profile deleted successfully for PRN: {}", prn);

        return ResponseEntity.ok(ApiResponse.success("Profile deleted successfully", null));
    }

    // ========== Image Management Endpoints ==========

    /**
     * Upload profile image
     * POST /api/profiles/{prn}/image
     */
    @PostMapping(value = "/{prn}/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<Void>> uploadProfileImage(
            @PathVariable String prn,
            @RequestParam("image") MultipartFile image) {
        log.info("Received request to upload profile image for PRN: {}", prn);

        profileService.uploadProfileImage(prn, image);
        log.info("Profile image uploaded successfully for PRN: {}", prn);

        return ResponseEntity.ok(ApiResponse.success("Profile image uploaded successfully", null));
    }

    /**
     * Get profile image
     * GET /api/profiles/{prn}/image
     */
    @GetMapping(value = "/{prn}/image", produces = {
            MediaType.IMAGE_JPEG_VALUE,
            MediaType.IMAGE_PNG_VALUE,
            MediaType.IMAGE_GIF_VALUE
    })
    public ResponseEntity<byte[]> getProfileImage(@PathVariable String prn) {
        log.info("Received request to get profile image for PRN: {}", prn);

        byte[] image = profileService.getProfileImage(prn);
        log.info("Profile image retrieved successfully for PRN: {}", prn);

        return ResponseEntity.ok()
                .contentType(MediaType.IMAGE_JPEG)
                .body(image);
    }

    /**
     * Delete profile image
     * DELETE /api/profiles/{prn}/image
     */
    @DeleteMapping("/{prn}/image")
    public ResponseEntity<ApiResponse<Void>> deleteProfileImage(@PathVariable String prn) {
        log.info("Received request to delete profile image for PRN: {}", prn);

        profileService.deleteProfileImage(prn);
        log.info("Profile image deleted successfully for PRN: {}", prn);

        return ResponseEntity.ok(ApiResponse.success("Profile image deleted successfully", null));
    }

    /**
     * Get image metadata
     * GET /api/profiles/{prn}/image/metadata
     */
    @GetMapping("/{prn}/image/metadata")
    public ResponseEntity<ApiResponse<ImageMetadataResponse>> getImageMetadata(
            @PathVariable String prn) {
        log.info("Received request to get image metadata for PRN: {}", prn);

        ImageMetadataResponse response = profileService.getImageMetadata(prn);
        log.info("Image metadata retrieved successfully for PRN: {}", prn);

        return ResponseEntity.ok(ApiResponse.success("Image metadata retrieved successfully", response));
    }

    // ========== Query Endpoints ==========

    /**
     * Get all active profiles
     * GET /api/profiles
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<ProfileResponse>>> getAllProfiles() {
        log.info("Received request to get all profiles");

        List<ProfileResponse> responses = profileService.getAllProfiles();
        log.info("Retrieved {} profiles", responses.size());

        return ResponseEntity.ok(ApiResponse.success("Profiles retrieved successfully", responses));
    }

    /**
     * Get profiles by department
     * GET /api/profiles/department/{department}
     */
    @GetMapping("/department/{department}")
    public ResponseEntity<ApiResponse<List<ProfileResponse>>> getProfilesByDepartment(
            @PathVariable String department) {
        log.info("Received request to get profiles by department: {}", department);

        List<ProfileResponse> responses = profileService.getProfilesByDepartment(department);
        log.info("Retrieved {} profiles for department: {}", responses.size(), department);

        return ResponseEntity.ok(ApiResponse.success("Profiles retrieved successfully", responses));
    }

    /**
     * Get profiles by year
     * GET /api/profiles/year/{year}
     */
    @GetMapping("/year/{year}")
    public ResponseEntity<ApiResponse<List<ProfileResponse>>> getProfilesByYear(
            @PathVariable @Min(1) @Max(4) Integer year) {
        log.info("Received request to get profiles by year: {}", year);

        List<ProfileResponse> responses = profileService.getProfilesByYear(year);
        log.info("Retrieved {} profiles for year: {}", responses.size(), year);

        return ResponseEntity.ok(ApiResponse.success("Profiles retrieved successfully", responses));
    }

    /**
     * Get profiles by department and year
     * GET /api/profiles/filter
     */
    @GetMapping("/filter")
    public ResponseEntity<ApiResponse<List<ProfileResponse>>> getProfilesByDepartmentAndYear(
            @RequestParam String department,
            @RequestParam @Min(1) @Max(4) Integer year) {
        log.info("Received request to get profiles by department: {} and year: {}", department, year);

        List<ProfileResponse> responses = profileService.getProfilesByDepartmentAndYear(department, year);
        log.info("Retrieved {} profiles", responses.size());

        return ResponseEntity.ok(ApiResponse.success("Profiles retrieved successfully", responses));
    }

    // ========== Paginated Endpoints ==========

    /**
     * Get all profiles with pagination
     * GET /api/profiles/paged
     */
    @GetMapping("/paged")
    public ResponseEntity<ApiResponse<PagedResponse<ProfileResponse>>> getAllProfilesPaged(
            @RequestParam(defaultValue = "0") @Min(0) Integer page,
            @RequestParam(defaultValue = "10") @Min(1) @Max(100) Integer size,
            @RequestParam(defaultValue = "fullName") String sortBy,
            @RequestParam(defaultValue = "ASC") String sortDirection) {
        log.info("Received request to get paged profiles: page={}, size={}", page, size);

        Sort.Direction direction = sortDirection.equalsIgnoreCase("DESC") ?
                Sort.Direction.DESC : Sort.Direction.ASC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));

        PagedResponse<ProfileResponse> response = profileService.getAllProfilesPaged(pageable);
        log.info("Retrieved page {} with {} profiles", page, response.getContent().size());

        return ResponseEntity.ok(ApiResponse.success("Profiles retrieved successfully", response));
    }

    /**
     * Search profiles with advanced filters
     * POST /api/profiles/search
     */
    @PostMapping("/search")
    public ResponseEntity<ApiResponse<PagedResponse<ProfileResponse>>> searchProfiles(
            @Valid @RequestBody ProfileSearchRequest searchRequest) {
        log.info("Received search request: {}", searchRequest);

        PagedResponse<ProfileResponse> response = profileService.searchProfiles(searchRequest);
        log.info("Search returned {} profiles", response.getTotalElements());

        return ResponseEntity.ok(ApiResponse.success("Search completed successfully", response));
    }

    // ========== Public Profile Endpoints ==========

    /**
     * Get public profile (limited information)
     * GET /api/profiles/public/{prn}
     */
    @GetMapping("/public/{prn}")
    public ResponseEntity<ApiResponse<PublicProfileResponse>> getPublicProfile(
            @PathVariable String prn) {
        log.info("Received request to get public profile for PRN: {}", prn);

        PublicProfileResponse response = profileService.getPublicProfile(prn);
        log.info("Public profile retrieved for PRN: {}", prn);

        return ResponseEntity.ok(ApiResponse.success("Public profile retrieved successfully", response));
    }

    /**
     * Get profile summary (minimal information)
     * GET /api/profiles/summary/{prn}
     */
    @GetMapping("/summary/{prn}")
    public ResponseEntity<ApiResponse<ProfileSummaryResponse>> getProfileSummary(
            @PathVariable String prn) {
        log.info("Received request to get profile summary for PRN: {}", prn);

        ProfileSummaryResponse response = profileService.getProfileSummary(prn);
        log.info("Profile summary retrieved for PRN: {}", prn);

        return ResponseEntity.ok(ApiResponse.success("Profile summary retrieved successfully", response));
    }

    // ========== Batch Operation Endpoints ==========

    /**
     * Create multiple profiles in batch
     * POST /api/profiles/batch
     */
    @PostMapping("/batch")
    public ResponseEntity<ApiResponse<BatchOperationResponse>> createProfilesBatch(
            @Valid @RequestBody BatchProfileRequest request) {
        log.info("Received batch creation request for {} profiles", request.getProfiles().size());

        BatchOperationResponse response = profileService.createProfilesBatch(request);
        log.info("Batch creation completed: {} successful, {} failed",
                response.getSuccessCount(), response.getFailureCount());

        HttpStatus status = response.getFailureCount() > 0 ?
                HttpStatus.MULTI_STATUS : HttpStatus.CREATED;

        return ResponseEntity.status(status)
                .body(ApiResponse.success("Batch operation completed", response));
    }

    /**
     * Get multiple profiles by PRNs
     * POST /api/profiles/bulk
     */
    @PostMapping("/bulk")
    public ResponseEntity<ApiResponse<List<ProfileResponse>>> getProfilesBulk(
            @Valid @RequestBody BulkProfileFetchRequest request) {
        log.info("Received bulk fetch request for {} PRNs", request.getPrns().size());

        List<ProfileResponse> responses = profileService.getProfilesBulk(request);
        log.info("Bulk fetch returned {} profiles", responses.size());

        return ResponseEntity.ok(ApiResponse.success("Profiles retrieved successfully", responses));
    }

    // ========== Validation Endpoints ==========

    /**
     * Check if profile exists by PRN
     * GET /api/profiles/exists/prn/{prn}
     */
    @GetMapping("/exists/prn/{prn}")
    public ResponseEntity<ApiResponse<ProfileExistenceResponse>> checkProfileExistsByPrn(
            @PathVariable String prn) {
        log.info("Checking profile existence for PRN: {}", prn);

        ProfileExistenceResponse response = profileService.checkProfileExistsByPrn(prn);
        log.info("Profile existence check for PRN {}: {}", prn, response.getExists());

        return ResponseEntity.ok(ApiResponse.success("Existence check completed", response));
    }

    /**
     * Check if profile exists by User ID
     * GET /api/profiles/exists/user/{userId}
     */
    @GetMapping("/exists/user/{userId}")
    public ResponseEntity<ApiResponse<ProfileExistenceResponse>> checkProfileExistsByUserId(
            @PathVariable Long userId) {
        log.info("Checking profile existence for UserId: {}", userId);

        ProfileExistenceResponse response = profileService.checkProfileExistsByUserId(userId);
        log.info("Profile existence check for UserId {}: {}", userId, response.getExists());

        return ResponseEntity.ok(ApiResponse.success("Existence check completed", response));
    }

    /**
     * Validate profile data before creation
     * POST /api/profiles/validate
     */
    @PostMapping("/validate")
    public ResponseEntity<ApiResponse<ValidationResponse>> validateProfile(
            @Valid @RequestBody ProfileCreateRequest request) {
        log.info("Validating profile data for PRN: {}", request.getPrn());

        ValidationResponse response = profileService.validateProfile(request);
        log.info("Validation result for PRN {}: {}", request.getPrn(),
                response.getValid() ? "VALID" : "INVALID");

        return ResponseEntity.ok(ApiResponse.success("Validation completed", response));
    }

    // ========== Statistics Endpoints ==========

    /**
     * Get overall profile statistics
     * GET /api/profiles/statistics
     */
    @GetMapping("/statistics")
    public ResponseEntity<ApiResponse<ProfileStatisticsResponse>> getProfileStatistics() {
        log.info("Received request to get profile statistics");

        ProfileStatisticsResponse response = profileService.getProfileStatistics();
        log.info("Profile statistics retrieved successfully");

        return ResponseEntity.ok(ApiResponse.success("Statistics retrieved successfully", response));
    }

    /**
     * Get department-wise statistics
     * GET /api/profiles/statistics/department
     */
    @GetMapping("/statistics/department")
    public ResponseEntity<ApiResponse<DepartmentStatistics>> getDepartmentStatistics() {
        log.info("Received request to get department statistics");

        DepartmentStatistics response = profileService.getDepartmentStatistics();
        log.info("Department statistics retrieved successfully");

        return ResponseEntity.ok(ApiResponse.success("Department statistics retrieved successfully", response));
    }

    /**
     * Get year-wise statistics
     * GET /api/profiles/statistics/year
     */
    @GetMapping("/statistics/year")
    public ResponseEntity<ApiResponse<YearStatistics>> getYearStatistics() {
        log.info("Received request to get year statistics");

        YearStatistics response = profileService.getYearStatistics();
        log.info("Year statistics retrieved successfully");

        return ResponseEntity.ok(ApiResponse.success("Year statistics retrieved successfully", response));
    }

    // ========== Health Check Endpoint ==========

    /**
     * Health check endpoint
     * GET /api/profiles/health
     */
    @GetMapping("/health")
    public ResponseEntity<ApiResponse<String>> healthCheck() {
        log.debug("Health check endpoint called");
        return ResponseEntity.ok(ApiResponse.success("Profile Management Service is running", "OK"));
    }
}