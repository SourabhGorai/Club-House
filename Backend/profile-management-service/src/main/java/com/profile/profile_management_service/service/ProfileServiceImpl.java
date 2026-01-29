package com.profile.profile_management_service.service;

import com.profile.profile_management_service.client.IndependentServiceClient;
import com.profile.profile_management_service.dto.*;
import com.profile.profile_management_service.exception.*;
import com.profile.profile_management_service.mapper.ProfileMapper;
import com.profile.profile_management_service.model.UserProfile;
import com.profile.profile_management_service.repository.ProfileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Implementation of ProfileService interface
 * Handles all business logic for profile management
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ProfileServiceImpl implements ProfileService {

    private final ProfileRepository profileRepository;
    private final ProfileMapper profileMapper;
    private final IndependentServiceClient indServiceClient;

    // Image validation constants
    private static final List<String> ALLOWED_IMAGE_TYPES = Arrays.asList(
            "image/jpeg", "image/jpg", "image/png", "image/gif"
    );
    private static final long MAX_IMAGE_SIZE = 500 * 1024; // 500KB in bytes

    // ========== Core CRUD Operations ==========

    @Override
    public ProfileResponse createProfile(ProfileCreateRequest request) {
        log.info("Creating profile for PRN: {}", request.getPrn());

        try {
            // Validate uniqueness
            validateProfileUniqueness(request);

            // Sanitize inputs
            request.setPrn(profileMapper.sanitizePrn(request.getPrn()));
            request.setFullName(profileMapper.sanitizeInput(request.getFullName()));
            request.setPhoneNumber(profileMapper.sanitizePhoneNumber(request.getPhoneNumber()));

            // Map to entity and save
            UserProfile profile = profileMapper.toUserProfile(request);
            UserProfile savedProfile = profileRepository.save(profile);

            DepartmentResponse deptName = indServiceClient
                    .getDepartmentById(savedProfile.getDepartmentId());

            log.info("Profile created successfully for PRN: {}", savedProfile.getPrn());
            return profileMapper.toProfileResponse(savedProfile, deptName.getName());

        } catch (DataIntegrityViolationException ex) {
            log.error("Data integrity violation while creating profile: {}", ex.getMessage());
            throw new ProfileAlreadyExistsException("Profile creation failed due to duplicate data");
        } catch (Exception ex) {
            log.error("Error creating profile: {}", ex.getMessage(), ex);
            throw new ProfileOperationException("Failed to create profile", ex);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public ProfileResponse getProfileByPrn(String prn) {
        log.debug("Fetching profile by PRN: {}", prn);

        String sanitizedPrn = profileMapper.sanitizePrn(prn);
        UserProfile profile = profileRepository.findByPrnAndIsActiveTrue(sanitizedPrn)
                .orElseThrow(() -> {
                    log.error("Profile not found with PRN: {}", sanitizedPrn);
                    return new ProfileNotFoundException("Profile not found with PRN: " + sanitizedPrn);
                });

        DepartmentResponse dept = indServiceClient.getDepartmentById(profile.getDepartmentId());

        log.debug("Profile found for PRN: {}", sanitizedPrn);
        return profileMapper.toProfileResponse(profile, dept.getName());
    }

    @Override
    public ProfileResponse updateProfile(String prn, ProfileUpdateRequest request) {
        log.info("Updating profile for PRN: {}", prn);

        String sanitizedPrn = profileMapper.sanitizePrn(prn);
        UserProfile profile = profileRepository.findByPrnAndIsActiveTrue(sanitizedPrn)
                .orElseThrow(() -> {
                    log.error("Profile not found with PRN: {}", sanitizedPrn);
                    return new ProfileNotFoundException("Profile not found with PRN: " + sanitizedPrn);
                });

        try {
            // Validate phone number uniqueness if being updated
            if (request.getPhoneNumber() != null &&
                    !request.getPhoneNumber().equals(profile.getPhoneNumber())) {

                String sanitizedPhone = profileMapper.sanitizePhoneNumber(request.getPhoneNumber());
                if (profileRepository.existsByPhoneNumber(sanitizedPhone)) {
                    log.error("Phone number already in use: {}", sanitizedPhone);
                    throw new DuplicateDataException("phoneNumber", sanitizedPhone,
                            "Phone number already in use");
                }
                request.setPhoneNumber(sanitizedPhone);
            }

            // Sanitize other inputs
            if (request.getFullName() != null) {
                request.setFullName(profileMapper.sanitizeInput(request.getFullName()));
            }
            if (request.getDepartmentId() != null) {
                request.setDepartmentId(request.getDepartmentId());
            }

            // Update profile
            profileMapper.updateUserProfileFromRequest(profile, request);
            UserProfile updatedProfile = profileRepository.save(profile);

            DepartmentResponse dept = indServiceClient
                    .getDepartmentById(updatedProfile.getDepartmentId());

            log.info("Profile updated successfully for PRN: {}", sanitizedPrn);
            return profileMapper.toProfileResponse(updatedProfile, dept.getName());

        } catch (DataIntegrityViolationException ex) {
            log.error("Data integrity violation while updating profile: {}", ex.getMessage());
            throw new ProfileAlreadyExistsException("Profile update failed due to duplicate data");
        } catch (Exception ex) {
            log.error("Error updating profile: {}", ex.getMessage(), ex);
            throw new ProfileOperationException("Failed to update profile", ex);
        }
    }

    @Override
    public void deleteProfile(String prn) {
        log.info("Soft deleting profile for PRN: {}", prn);

        String sanitizedPrn = profileMapper.sanitizePrn(prn);
        UserProfile profile = profileRepository.findByPrnAndIsActiveTrue(sanitizedPrn)
                .orElseThrow(() -> {
                    log.error("Profile not found with PRN: {}", sanitizedPrn);
                    return new ProfileNotFoundException("Profile not found with PRN: " + sanitizedPrn);
                });

        try {
            profile.setIsActive(false);
            profileRepository.save(profile);
            log.info("Profile soft deleted successfully for PRN: {}", sanitizedPrn);
        } catch (Exception ex) {
            log.error("Error deleting profile: {}", ex.getMessage(), ex);
            throw new ProfileOperationException("Failed to delete profile", ex);
        }
    }

    // ========== Private Helper Methods ==========

    private void validateProfileUniqueness(ProfileCreateRequest request) {
        log.debug("Validating profile uniqueness for PRN: {}", request.getPrn());

        if (profileRepository.existsByPrn(request.getPrn())) {
            log.error("Profile already exists with PRN: {}", request.getPrn());
            throw new DuplicateDataException("prn", request.getPrn(),
                    "Profile with PRN " + request.getPrn() + " already exists");
        }

        if (profileRepository.existsByPhoneNumber(request.getPhoneNumber())) {
            log.error("Profile already exists with phone number");
            throw new DuplicateDataException("phoneNumber", "***",
                    "Profile with this phone number already exists");
        }

        log.debug("Profile uniqueness validation passed");
    }

    // ========== Image Operations ==========

    @Override
    public void uploadProfileImage(String prn, MultipartFile image) {
        log.info("Uploading profile image for PRN: {}", prn);

        String sanitizedPrn = profileMapper.sanitizePrn(prn);

        // Validate image
        validateImage(image);

        UserProfile profile = profileRepository.findByPrnAndIsActiveTrue(sanitizedPrn)
                .orElseThrow(() -> {
                    log.error("Profile not found with PRN: {}", sanitizedPrn);
                    return new ProfileNotFoundException("Profile not found with PRN: " + sanitizedPrn);
                });

        try {
            byte[] imageBytes = image.getBytes();
            profile.setProfileImage(imageBytes);
            profile.setImageType(image.getContentType());
            profile.setImageSize(image.getSize());
            profile.setImageUploadedAt(LocalDateTime.now());

            profileRepository.save(profile);
            log.info("Profile image uploaded successfully for PRN: {}", sanitizedPrn);

        } catch (IOException ex) {
            log.error("Error reading image file for PRN: {}", sanitizedPrn, ex);
            throw new ProfileOperationException("Failed to upload image", ex);
        } catch (Exception ex) {
            log.error("Error uploading image for PRN: {}", sanitizedPrn, ex);
            throw new ProfileOperationException("Failed to upload image", ex);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] getProfileImage(String prn) {
        log.debug("Fetching profile image for PRN: {}", prn);

        String sanitizedPrn = profileMapper.sanitizePrn(prn);
        UserProfile profile = profileRepository.findByPrnAndIsActiveTrue(sanitizedPrn)
                .orElseThrow(() -> {
                    log.error("Profile not found with PRN: {}", sanitizedPrn);
                    return new ProfileNotFoundException("Profile not found with PRN: " + sanitizedPrn);
                });

        if (profile.getProfileImage() == null) {
            log.error("No profile image found for PRN: {}", sanitizedPrn);
            throw new ProfileNotFoundException("No profile image found for PRN: " + sanitizedPrn);
        }

        log.debug("Profile image retrieved for PRN: {}", sanitizedPrn);
        return profile.getProfileImage();
    }

    @Override
    public void deleteProfileImage(String prn) {
        log.info("Deleting profile image for PRN: {}", prn);

        String sanitizedPrn = profileMapper.sanitizePrn(prn);
        UserProfile profile = profileRepository.findByPrnAndIsActiveTrue(sanitizedPrn)
                .orElseThrow(() -> {
                    log.error("Profile not found with PRN: {}", sanitizedPrn);
                    return new ProfileNotFoundException("Profile not found with PRN: " + sanitizedPrn);
                });

        try {
            profile.setProfileImage(null);
            profile.setImageType(null);
            profile.setImageSize(null);
            profile.setImageUploadedAt(null);

            profileRepository.save(profile);
            log.info("Profile image deleted successfully for PRN: {}", sanitizedPrn);
        } catch (Exception ex) {
            log.error("Error deleting image for PRN: {}", sanitizedPrn, ex);
            throw new ProfileOperationException("Failed to delete image", ex);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public ImageMetadataResponse getImageMetadata(String prn) {
        log.debug("Fetching image metadata for PRN: {}", prn);

        String sanitizedPrn = profileMapper.sanitizePrn(prn);
        UserProfile profile = profileRepository.findByPrnAndIsActiveTrue(sanitizedPrn)
                .orElseThrow(() -> {
                    log.error("Profile not found with PRN: {}", sanitizedPrn);
                    return new ProfileNotFoundException("Profile not found with PRN: " + sanitizedPrn);
                });

        log.debug("Image metadata retrieved for PRN: {}", sanitizedPrn);
        return profileMapper.toImageMetadataResponse(profile);
    }

    // ========== Query Operations ==========

    @Override
    @Transactional(readOnly = true)
    public List<ProfileResponse> getAllProfiles() {
        log.debug("Fetching all active profiles");

        List<UserProfile> profiles = profileRepository.findByIsActiveTrue();
        log.debug("Found {} active profiles", profiles.size());

        return convertToProfileResponseList(profiles);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProfileResponse> getProfilesByDepartment(Long departmentId) {
        log.debug("Fetching profiles for departmentId: {}", departmentId);

        if (departmentId == null || departmentId <= 0) {
            log.error("Invalid departmentId: {}", departmentId);
            throw new IllegalArgumentException("Department ID must be positive");
        }

        List<UserProfile> profiles = profileRepository.findByDepartmentIdAndIsActiveTrue(departmentId);
        log.debug("Found {} profiles for departmentId: {}", profiles.size(), departmentId);

        return convertToProfileResponseList(profiles);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProfileResponse> getProfilesByYear(Integer year) {
        log.debug("Fetching profiles for year: {}", year);

        if (year == null || year < 1 || year > 4) {
            log.error("Invalid year: {}", year);
            throw new IllegalArgumentException("Year must be between 1 and 4");
        }

        List<UserProfile> profiles = profileRepository.findByYearAndIsActiveTrue(year);
        log.debug("Found {} profiles for year: {}", profiles.size(), year);

        return convertToProfileResponseList(profiles);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProfileResponse> getProfilesByDepartmentAndYear(Long departmentId, Integer year) {
        log.debug("Fetching profiles for departmentId: {} and year: {}", departmentId, year);

        if (departmentId == null || departmentId <= 0) {
            log.error("Invalid departmentId: {}", departmentId);
            throw new IllegalArgumentException("Department ID must be positive");
        }

        if (year == null || year < 1 || year > 4) {
            log.error("Invalid year: {}", year);
            throw new IllegalArgumentException("Year must be between 1 and 4");
        }

        List<UserProfile> profiles = profileRepository.findByDepartmentIdAndYear(departmentId, year);
        log.debug("Found {} profiles for departmentId: {} and year: {}",
                profiles.size(), departmentId, year);

        return convertToProfileResponseList(profiles);
    }

    // ========== Paginated Operations ==========

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<ProfileResponse> getAllProfilesPaged(Pageable pageable) {
        log.debug("Fetching all profiles with pagination: page={}, size={}",
                pageable.getPageNumber(), pageable.getPageSize());

        Page<UserProfile> profilePage = profileRepository.findByIsActiveTrue(pageable);
        log.debug("Found {} total profiles, returning page {}",
                profilePage.getTotalElements(), profilePage.getNumber());

        return createPagedResponse(profilePage);
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<ProfileResponse> getProfilesByDepartmentPaged(
            Long departmentId, Pageable pageable) {
        log.debug("Fetching profiles for departmentId: {} with pagination", departmentId);

        if (departmentId == null || departmentId <= 0) {
            log.error("Invalid departmentId: {}", departmentId);
            throw new IllegalArgumentException("Department ID must be positive");
        }

        Page<UserProfile> profilePage = profileRepository
                .findByDepartmentIdAndIsActiveTrue(departmentId, pageable);

        log.debug("Found {} profiles for departmentId: {}",
                profilePage.getTotalElements(), departmentId);

        return createPagedResponse(profilePage);
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<ProfileResponse> searchProfiles(ProfileSearchRequest searchRequest) {
        log.debug("Searching profiles with criteria: {}", searchRequest);

        // Create pageable with sorting
        Sort sort = Sort.by(
                searchRequest.getSortDirection().equalsIgnoreCase("DESC") ?
                        Sort.Direction.DESC : Sort.Direction.ASC,
                searchRequest.getSortBy()
        );

        Pageable pageable = PageRequest.of(
                searchRequest.getPage(),
                searchRequest.getSize(),
                sort
        );

        Page<UserProfile> profilePage;

        // Apply filters
        if (searchRequest.getSearchTerm() != null && !searchRequest.getSearchTerm().isBlank()) {
            String sanitizedTerm = profileMapper.sanitizeInput(searchRequest.getSearchTerm());
            profilePage = profileRepository.advancedSearch(sanitizedTerm, pageable);
        } else if (searchRequest.getDepartmentId() != null && searchRequest.getYear() != null) {
            profilePage = profileRepository.findByDepartmentIdAndYear(
                    searchRequest.getDepartmentId(), searchRequest.getYear(), pageable);
        } else if (searchRequest.getDepartmentId() != null) {
            profilePage = profileRepository.findByDepartmentIdAndIsActiveTrue(
                    searchRequest.getDepartmentId(), pageable);
        } else if (searchRequest.getYear() != null) {
            profilePage = profileRepository.findByYearAndIsActiveTrue(searchRequest.getYear(), pageable);
        } else {
            profilePage = profileRepository.findByIsActiveTrue(pageable);
        }

        log.debug("Search returned {} profiles", profilePage.getTotalElements());
        return createPagedResponse(profilePage);
    }

    // ========== Public/Limited Access Operations ==========

    @Override
    @Transactional(readOnly = true)
    public PublicProfileResponse getPublicProfile(String prn) {
        log.debug("Fetching public profile for PRN: {}", prn);

        String sanitizedPrn = profileMapper.sanitizePrn(prn);
        UserProfile profile = profileRepository.findByPrnAndIsActiveTrue(sanitizedPrn)
                .orElseThrow(() -> {
                    log.error("Profile not found with PRN: {}", sanitizedPrn);
                    return new ProfileNotFoundException("Profile not found with PRN: " + sanitizedPrn);
                });

        DepartmentResponse dept = indServiceClient.getDepartmentById(profile.getDepartmentId());

        log.debug("Public profile retrieved for PRN: {}", sanitizedPrn);
        return profileMapper.toPublicProfileResponse(profile, dept.getName());
    }

    @Override
    @Transactional(readOnly = true)
    public ProfileSummaryResponse getProfileSummary(String prn) {
        log.debug("Fetching profile summary for PRN: {}", prn);

        String sanitizedPrn = profileMapper.sanitizePrn(prn);
        UserProfile profile = profileRepository.findByPrnAndIsActiveTrue(sanitizedPrn)
                .orElseThrow(() -> {
                    log.error("Profile not found with PRN: {}", sanitizedPrn);
                    return new ProfileNotFoundException("Profile not found with PRN: " + sanitizedPrn);
                });

        DepartmentResponse dept = indServiceClient.getDepartmentById(profile.getDepartmentId());

        log.debug("Profile summary retrieved for PRN: {}", sanitizedPrn);
        return profileMapper.toProfileSummaryResponse(profile, dept.getName());
    }

    // ========== Batch Operations ==========

    @Override
    public BatchOperationResponse createProfilesBatch(BatchProfileRequest request) {
        log.info("Creating {} profiles in batch", request.getProfiles().size());

        List<BatchOperationResult> results = request.getProfiles().stream()
                .map(this::createSingleProfileInBatch)
                .collect(Collectors.toList());

        long successCount = results.stream().filter(BatchOperationResult::getSuccess).count();
        long failureCount = results.size() - successCount;

        log.info("Batch creation completed: {} successful, {} failed", successCount, failureCount);

        return BatchOperationResponse.builder()
                .totalRequests(results.size())
                .successCount((int) successCount)
                .failureCount((int) failureCount)
                .results(results)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProfileResponse> getProfilesBulk(BulkProfileFetchRequest request) {
        log.debug("Fetching {} profiles in bulk", request.getPrns().size());

        List<String> sanitizedPrns = request.getPrns().stream()
                .map(profileMapper::sanitizePrn)
                .collect(Collectors.toList());

        List<UserProfile> profiles = profileRepository.findByPrnIn(sanitizedPrns);
        log.debug("Retrieved {} profiles out of {} requested", profiles.size(), sanitizedPrns.size());

        return convertToProfileResponseList(profiles);
    }

    // ========== Validation Operations ==========

    @Override
    @Transactional(readOnly = true)
    public ProfileExistenceResponse checkProfileExistsByPrn(String prn) {
        log.debug("Checking profile existence by PRN: {}", prn);

        String sanitizedPrn = profileMapper.sanitizePrn(prn);
        boolean exists = profileRepository.existsByPrnAndIsActiveTrue(sanitizedPrn);

        log.debug("Profile exists for PRN {}: {}", sanitizedPrn, exists);

        return ProfileExistenceResponse.builder()
                .prn(sanitizedPrn)
                .exists(exists)
                .message(exists ? "Profile exists" : "Profile does not exist")
                .build();
    }

    @Override
    public ValidationResponse validateProfile(ProfileCreateRequest request) {
        log.debug("Validating profile data for PRN: {}", request.getPrn());

        List<ValidationError> errors = new ArrayList<>();

        // Check PRN uniqueness
        if (profileRepository.existsByPrn(request.getPrn())) {
            errors.add(ValidationError.builder()
                    .field("prn")
                    .message("PRN already exists")
                    .rejectedValue(request.getPrn())
                    .build());
        }

        // Check phone number uniqueness
        if (profileRepository.existsByPhoneNumber(request.getPhoneNumber())) {
            errors.add(ValidationError.builder()
                    .field("phoneNumber")
                    .message("Phone number already exists")
                    .rejectedValue("***")
                    .build());
        }

        boolean isValid = errors.isEmpty();
        log.debug("Profile validation result: {}", isValid ? "VALID" : "INVALID");

        return ValidationResponse.builder()
                .valid(isValid)
                .errors(errors)
                .build();
    }

    // ========== Statistics Operations ==========

    @Override
    @Transactional(readOnly = true)
    public ProfileStatisticsResponse getProfileStatistics() {
        log.debug("Fetching profile statistics");

        long totalProfiles = profileRepository.count();
        long activeProfiles = profileRepository.countActiveProfiles();
        long inactiveProfiles = totalProfiles - activeProfiles;
        long profilesWithImages = profileRepository.countProfilesWithImages();

        DepartmentStatistics deptStats = getDepartmentStatistics();
        YearStatistics yearStats = getYearStatistics();

        log.debug("Statistics: Total={}, Active={}, Inactive={}, WithImages={}",
                totalProfiles, activeProfiles, inactiveProfiles, profilesWithImages);

        return ProfileStatisticsResponse.builder()
                .totalProfiles(totalProfiles)
                .activeProfiles(activeProfiles)
                .inactiveProfiles(inactiveProfiles)
                .profilesWithImages(profilesWithImages)
                .departmentStatistics(deptStats)
                .yearStatistics(yearStats)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public DepartmentStatistics getDepartmentStatistics() {
        log.debug("Fetching department statistics");

        List<Object[]> results = profileRepository.getDepartmentStatistics();
        Map<Long, Long> deptMap = results.stream()
                .collect(Collectors.toMap(
                        arr -> (Long) arr[0],  // departmentId
                        arr -> (Long) arr[1]   // count
                ));

        log.debug("Department statistics: {}", deptMap);

        return DepartmentStatistics.builder()
                .profilesByDepartment(deptMap)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public YearStatistics getYearStatistics() {
        log.debug("Fetching year statistics");

        List<Object[]> results = profileRepository.getYearStatistics();
        Map<Integer, Long> yearMap = results.stream()
                .collect(Collectors.toMap(
                        arr -> (Integer) arr[0],
                        arr -> (Long) arr[1]
                ));

        log.debug("Year statistics: {}", yearMap);

        return YearStatistics.builder()
                .profilesByYear(yearMap)
                .build();
    }

    // ========== Additional Operations ==========

    @Override
    public List<String> filterPrnsByYear(List<String> prns, Integer year) {
        return profileRepository.findPrnsByPrnInAndYear(prns, year);
    }

    @Override
    public List<ProfileResponse> fetchList(List<String> prns) {
        log.info("Attempting to fetch all the profiles for PRNs: {}", prns);

        if (prns == null || prns.isEmpty()) {
            return Collections.emptyList();
        }

        List<UserProfile> profiles = profileRepository.findByPrnIn(prns);
        return convertToProfileResponseList(profiles);
    }

    // ========== Private Helper Methods ==========

    private void validateImage(MultipartFile image) {
        if (image == null || image.isEmpty()) {
            log.error("Image file is empty or null");
            throw new InvalidImageException("Image file is required");
        }

        if (image.getSize() > MAX_IMAGE_SIZE) {
            log.error("Image size exceeds limit. Size: {} bytes", image.getSize());
            throw new InvalidImageException("Image size exceeds maximum limit of 500KB");
        }

        String contentType = image.getContentType();
        if (contentType == null || !ALLOWED_IMAGE_TYPES.contains(contentType.toLowerCase())) {
            log.error("Invalid image type: {}", contentType);
            throw new InvalidImageException("Only JPEG, JPG, PNG, and GIF images are allowed");
        }

        log.debug("Image validation passed. Type: {}, Size: {} bytes", contentType, image.getSize());
    }

    private PagedResponse<ProfileResponse> createPagedResponse(Page<UserProfile> profilePage) {
        List<ProfileResponse> content = convertToProfileResponseList(profilePage.getContent());

        return PagedResponse.<ProfileResponse>builder()
                .content(content)
                .pageNumber(profilePage.getNumber())
                .pageSize(profilePage.getSize())
                .totalElements(profilePage.getTotalElements())
                .totalPages(profilePage.getTotalPages())
                .last(profilePage.isLast())
                .first(profilePage.isFirst())
                .build();
    }

    private BatchOperationResult createSingleProfileInBatch(ProfileCreateRequest request) {
        try {
            createProfile(request);
            log.debug("Successfully created profile in batch for PRN: {}", request.getPrn());

            return BatchOperationResult.builder()
                    .prn(request.getPrn())
                    .success(true)
                    .message("Profile created successfully")
                    .build();

        } catch (DuplicateDataException ex) {
            log.warn("Duplicate data in batch for PRN: {}", request.getPrn());

            return BatchOperationResult.builder()
                    .prn(request.getPrn())
                    .success(false)
                    .message(ex.getMessage())
                    .errorCode("DUPLICATE_DATA")
                    .build();

        } catch (Exception ex) {
            log.error("Error creating profile in batch for PRN: {}", request.getPrn(), ex);

            return BatchOperationResult.builder()
                    .prn(request.getPrn())
                    .success(false)
                    .message("Failed to create profile: " + ex.getMessage())
                    .errorCode("OPERATION_FAILED")
                    .build();
        }
    }

    /**
     * Helper method to convert list of UserProfile to ProfileResponse
     * Fetches all departments in a single batch call to avoid N+1 queries
     */
    private List<ProfileResponse> convertToProfileResponseList(List<UserProfile> profiles) {
        if (profiles == null || profiles.isEmpty()) {
            return Collections.emptyList();
        }

        // Extract unique department IDs
        List<Long> departmentIds = profiles.stream()
                .map(UserProfile::getDepartmentId)
                .distinct()
                .collect(Collectors.toList());

        // Fetch all departments in one batch call
        List<DepartmentResponse> departments = indServiceClient.getDepartmentByIds(departmentIds);

        // Create a map of departmentId -> departmentName
        Map<Long, String> departmentMap = departments.stream()
                .collect(Collectors.toMap(
                        DepartmentResponse::getDepartmentId,
                        DepartmentResponse::getName
                ));

        // Map profiles to responses using the department map
        return profileMapper.toProfileResponseList(profiles, departmentMap);
    }
}