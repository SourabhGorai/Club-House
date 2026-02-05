package com.profile.profile_management_service.mapper;

import com.profile.profile_management_service.dto.request.ProfileCreateRequest;
import com.profile.profile_management_service.dto.request.ProfileUpdateRequest;
import com.profile.profile_management_service.dto.response.ImageMetadataResponse;
import com.profile.profile_management_service.dto.response.ProfileResponse;
import com.profile.profile_management_service.dto.response.ProfileSummaryResponse;
import com.profile.profile_management_service.dto.response.PublicProfileResponse;
import com.profile.profile_management_service.model.UserProfile;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Mapper utility class for converting between entities and DTOs
 * Provides secure data transformation for API responses
 */
@Component
@Slf4j
public class ProfileMapper {

    /**
     * Map UserProfile entity to ProfileResponse DTO
     * Excludes sensitive image data from response
     */
    public ProfileResponse toProfileResponse(UserProfile profile, String deptName) {
        if (profile == null) {
            log.warn("Attempted to map null UserProfile to ProfileResponse");
            return null;
        }

        log.debug("Mapping UserProfile to ProfileResponse for PRN: {}", profile.getPrn());

        return ProfileResponse.builder()
                .prn(profile.getPrn())
                .fullName(profile.getFullName())
                .department(deptName)
                .year(profile.getYear())
                .phoneNumber(profile.getPhoneNumber())
                .hasProfileImage(profile.getProfileImage() != null)
                .imageUrl(profile.getProfileImage() != null ?
                        "/api/profiles/" + profile.getPrn() + "/image" : null)
                .createdAt(profile.getCreatedAt())
                .updatedAt(profile.getUpdatedAt())
                .build();
    }

    /**
     * Map UserProfile entity to PublicProfileResponse DTO
     * Excludes sensitive information like phone number and userId
     */
    public PublicProfileResponse toPublicProfileResponse(UserProfile profile, String deptName) {
        if (profile == null) {
            log.warn("Attempted to map null UserProfile to PublicProfileResponse");
            return null;
        }

        log.debug("Mapping UserProfile to PublicProfileResponse for PRN: {}", profile.getPrn());

        return PublicProfileResponse.builder()
                .prn(profile.getPrn())
                .fullName(profile.getFullName())
                .department(deptName)
                .year(profile.getYear())
                .hasProfileImage(profile.getProfileImage() != null)
                .imageUrl(profile.getProfileImage() != null ?
                        "/api/profiles/" + profile.getPrn() + "/image" : null)
                .build();
    }

    /**
     * Map UserProfile entity to ProfileSummaryResponse DTO
     * Provides minimal profile information
     */
    public ProfileSummaryResponse toProfileSummaryResponse(UserProfile profile, String deptName) {
        if (profile == null) {
            log.warn("Attempted to map null UserProfile to ProfileSummaryResponse");
            return null;
        }

        log.debug("Mapping UserProfile to ProfileSummaryResponse for PRN: {}", profile.getPrn());

        return ProfileSummaryResponse.builder()
                .prn(profile.getPrn())
                .fullName(profile.getFullName())
                .department(deptName)
                .year(profile.getYear())
                .hasProfileImage(profile.getProfileImage() != null)
                .build();
    }

    /**
     * Map UserProfile entity to ImageMetadataResponse DTO
     */
    public ImageMetadataResponse toImageMetadataResponse(UserProfile profile) {
        if (profile == null) {
            log.warn("Attempted to map null UserProfile to ImageMetadataResponse");
            return null;
        }

        log.debug("Mapping UserProfile to ImageMetadataResponse for PRN: {}", profile.getPrn());

        return ImageMetadataResponse.builder()
                .prn(profile.getPrn())
                .hasImage(profile.getProfileImage() != null)
                .imageType(profile.getImageType())
                .imageSize(profile.getImageSize())
                .uploadedAt(profile.getImageUploadedAt())
                .imageUrl(profile.getProfileImage() != null ?
                        "/api/profiles/" + profile.getPrn() + "/image" : null)
                .build();
    }

    /* ================= LIST MAPPERS ================= */

    /**
     * Map list of UserProfile entities to ProfileResponse DTOs
     * Uses department map to avoid N+1 queries
     */
    public List<ProfileResponse> toProfileResponseList(
            List<UserProfile> profiles,
            Map<Long, String> departmentMap
    ) {
        if (profiles == null || profiles.isEmpty()) {
            log.debug("Empty profile list provided for mapping");
            return List.of();
        }

        log.debug("Mapping {} profiles to ProfileResponse list", profiles.size());

        return profiles.stream()
                .map(profile -> toProfileResponse(
                        profile,
                        departmentMap.getOrDefault(profile.getDepartmentId(), "Unknown")
                ))
                .collect(Collectors.toList());
    }

    /**
     * Map list of UserProfile entities to PublicProfileResponse DTOs
     * Uses department map to avoid N+1 queries
     */
    public List<PublicProfileResponse> toPublicProfileResponseList(
            List<UserProfile> profiles,
            Map<Long, String> departmentMap
    ) {
        if (profiles == null || profiles.isEmpty()) {
            log.debug("Empty profile list provided for mapping");
            return List.of();
        }

        log.debug("Mapping {} profiles to PublicProfileResponse list", profiles.size());

        return profiles.stream()
                .map(profile -> toPublicProfileResponse(
                        profile,
                        departmentMap.getOrDefault(profile.getDepartmentId(), "Unknown")
                ))
                .collect(Collectors.toList());
    }

    /**
     * Map list of UserProfile entities to ProfileSummaryResponse DTOs
     * Uses department map to avoid N+1 queries
     */
    public List<ProfileSummaryResponse> toProfileSummaryResponseList(
            List<UserProfile> profiles,
            Map<Long, String> departmentMap
    ) {
        if (profiles == null || profiles.isEmpty()) {
            log.debug("Empty profile list provided for mapping");
            return List.of();
        }

        log.debug("Mapping {} profiles to ProfileSummaryResponse list", profiles.size());

        return profiles.stream()
                .map(profile -> toProfileSummaryResponse(
                        profile,
                        departmentMap.getOrDefault(profile.getDepartmentId(), "Unknown")
                ))
                .collect(Collectors.toList());
    }

    /* ================= REQUEST → ENTITY ================= */

    /**
     * Map ProfileCreateRequest DTO to UserProfile entity
     */
    public UserProfile toUserProfile(ProfileCreateRequest request) {
        if (request == null) {
            log.warn("Attempted to map null ProfileCreateRequest to UserProfile");
            return null;
        }

        log.debug("Mapping ProfileCreateRequest to UserProfile for PRN: {}", request.getPrn());

        return UserProfile.builder()
                .prn(request.getPrn().toUpperCase())
                .fullName(request.getFullName().trim())
                .departmentId(request.getDepartmentId())
                .year(request.getYear())
                .phoneNumber(request.getPhoneNumber().trim())
                .isActive(true)
                .build();
    }

    /**
     * Update UserProfile entity from ProfileUpdateRequest DTO
     * Only updates non-null fields
     */
    public void updateUserProfileFromRequest(UserProfile profile, ProfileUpdateRequest request) {
        if (profile == null || request == null) {
            log.warn("Attempted to update with null profile or request");
            return;
        }

        log.debug("Updating UserProfile for PRN: {}", profile.getPrn());

        if (request.getFullName() != null && !request.getFullName().isBlank()) {
            profile.setFullName(request.getFullName().trim());
            log.debug("Updated fullName for PRN: {}", profile.getPrn());
        }

        if (request.getDepartmentId() != null) {
            profile.setDepartmentId(request.getDepartmentId());
            log.debug("Updated department for PRN: {}", profile.getPrn());
        }

        if (request.getYear() != null) {
            profile.setYear(request.getYear());
            log.debug("Updated year for PRN: {}", profile.getPrn());
        }

        if (request.getPhoneNumber() != null && !request.getPhoneNumber().isBlank()) {
            profile.setPhoneNumber(request.getPhoneNumber().trim());
            log.debug("Updated phoneNumber for PRN: {}", profile.getPrn());
        }
    }

    /* ================= SANITIZATION METHODS ================= */

    /**
     * Sanitize input string to prevent injection attacks
     */
    public String sanitizeInput(String input) {
        if (input == null) {
            return null;
        }

        // Remove any potentially dangerous characters
        String sanitized = input.trim()
                .replaceAll("[<>\"'%;()&+]", "");

        log.debug("Sanitized input from '{}' to '{}'", input, sanitized);
        return sanitized;
    }

    /**
     * Validate and sanitize PRN format
     */
    public String sanitizePrn(String prn) {
        if (prn == null || prn.isBlank()) {
            log.warn("Attempted to sanitize null or blank PRN");
            return null;
        }

        String sanitized = prn.trim().toUpperCase().replaceAll("[^A-Z0-9]", "");
        log.debug("Sanitized PRN from '{}' to '{}'", prn, sanitized);
        return sanitized;
    }

    /**
     * Validate and sanitize phone number
     */
    public String sanitizePhoneNumber(String phoneNumber) {
        if (phoneNumber == null || phoneNumber.isBlank()) {
            log.warn("Attempted to sanitize null or blank phone number");
            return null;
        }

        String sanitized = phoneNumber.trim().replaceAll("[^0-9]", "");
        log.debug("Sanitized phone number");
        return sanitized;
    }
}