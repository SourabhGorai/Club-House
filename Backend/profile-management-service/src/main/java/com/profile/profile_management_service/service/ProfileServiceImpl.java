package com.profile.profile_management_service.service;

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

    // Image validation constants
    private static final List<String> ALLOWED_IMAGE_TYPES = Arrays.asList(
            "image/jpeg", "image/jpg", "image/png", "image/gif"
    );
    private static final long MAX_IMAGE_SIZE = 500 * 1024; // 500KB in bytes

    // ========== Core CRUD Operations ==========

    @Override
    public ProfileResponse createProfile(ProfileCreateRequest request) {
//        log.info("Creating profile for PRN: {}, UserId: {}", request.getPrn(), request.getUserId());
        log.info("Creating profile for PRN: {}", request.getPrn());

        try {
            // Validate uniqueness
            validateProfileUniqueness(request);

            // Sanitize inputs
            request.setPrn(profileMapper.sanitizePrn(request.getPrn()));
            request.setFullName(profileMapper.sanitizeInput(request.getFullName()));
            request.setDepartment(profileMapper.sanitizeInput(request.getDepartment()));
            request.setPhoneNumber(profileMapper.sanitizePhoneNumber(request.getPhoneNumber()));

            // Map to entity and save
            UserProfile profile = profileMapper.toUserProfile(request);
            UserProfile savedProfile = profileRepository.save(profile);

            log.info("Profile created successfully for PRN: {}", savedProfile.getPrn());
            return profileMapper.toProfileResponse(savedProfile);

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

        log.debug("Profile found for PRN: {}", sanitizedPrn);
        return profileMapper.toProfileResponse(profile);
    }

//    @Override
//    @Transactional(readOnly = true)
//    public ProfileResponse getProfileByUserId(Long userId) {
//        log.debug("Fetching profile by UserId: {}", userId);
//
//        if (userId == null || userId <= 0) {
//            log.error("Invalid userId: {}", userId);
//            throw new IllegalArgumentException("User ID must be positive");
//        }
//
//        UserProfile profile = profileRepository.findByUserIdAndIsActiveTrue(userId)
//                .orElseThrow(() -> {
//                    log.error("Profile not found for UserId: {}", userId);
//                    return new ProfileNotFoundException("Profile not found for User ID: " + userId);
//                });
//
//        log.debug("Profile found for UserId: {}", userId);
//        return profileMapper.toProfileResponse(profile);
//    }

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
            if (request.getDepartment() != null) {
                request.setDepartment(profileMapper.sanitizeInput(request.getDepartment()));
            }

            // Update profile
            profileMapper.updateUserProfileFromRequest(profile, request);
            UserProfile updatedProfile = profileRepository.save(profile);

            log.info("Profile updated successfully for PRN: {}", sanitizedPrn);
            return profileMapper.toProfileResponse(updatedProfile);

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

//        if (profileRepository.existsByUserId(request.getUserId())) {
//            log.error("Profile already exists for UserId: {}", request.getUserId());
//            throw new DuplicateDataException("userId", request.getUserId().toString(),
//                    "Profile for User ID " + request.getUserId() + " already exists");
//        }

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

        return profileMapper.toProfileResponseList(profiles);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProfileResponse> getProfilesByDepartment(String department) {
        log.debug("Fetching profiles for department: {}", department);

        String sanitizedDept = profileMapper.sanitizeInput(department);
        List<UserProfile> profiles = profileRepository.findByDepartmentAndIsActiveTrue(sanitizedDept);
        log.debug("Found {} profiles for department: {}", profiles.size(), sanitizedDept);

        return profileMapper.toProfileResponseList(profiles);
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

        return profileMapper.toProfileResponseList(profiles);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProfileResponse> getProfilesByDepartmentAndYear(String department, Integer year) {
        log.debug("Fetching profiles for department: {} and year: {}", department, year);

        String sanitizedDept = profileMapper.sanitizeInput(department);

        if (year == null || year < 1 || year > 4) {
            log.error("Invalid year: {}", year);
            throw new IllegalArgumentException("Year must be between 1 and 4");
        }

        List<UserProfile> profiles = profileRepository.findByDepartmentAndYear(sanitizedDept, year);
        log.debug("Found {} profiles for department: {} and year: {}",
                profiles.size(), sanitizedDept, year);

        return profileMapper.toProfileResponseList(profiles);
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
            String department, Pageable pageable) {
        log.debug("Fetching profiles for department: {} with pagination", department);

        String sanitizedDept = profileMapper.sanitizeInput(department);
        Page<UserProfile> profilePage = profileRepository
                .findByDepartmentAndIsActiveTrue(sanitizedDept, pageable);

        log.debug("Found {} profiles for department: {}",
                profilePage.getTotalElements(), sanitizedDept);

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
        } else if (searchRequest.getDepartment() != null && searchRequest.getYear() != null) {
            String sanitizedDept = profileMapper.sanitizeInput(searchRequest.getDepartment());
            profilePage = profileRepository.findByDepartmentAndYear(
                    sanitizedDept, searchRequest.getYear(), pageable);
        } else if (searchRequest.getDepartment() != null) {
            String sanitizedDept = profileMapper.sanitizeInput(searchRequest.getDepartment());
            profilePage = profileRepository.findByDepartmentAndIsActiveTrue(sanitizedDept, pageable);
        } else if (searchRequest.getYear() != null) {
            profilePage = profileRepository.findByYearAndIsActiveTrue(searchRequest.getYear(), pageable);
        } else {
            profilePage = profileRepository.findByIsActiveTrue(pageable);
        }

        log.debug("Search returned {} profiles", profilePage.getTotalElements());
        return createPagedResponse(profilePage);
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
        List<ProfileResponse> content = profileMapper.toProfileResponseList(profilePage.getContent());

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

    // Continue ProfileServiceImpl class - Batch and Statistics Operations

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

        log.debug("Public profile retrieved for PRN: {}", sanitizedPrn);
        return profileMapper.toPublicProfileResponse(profile);
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

        log.debug("Profile summary retrieved for PRN: {}", sanitizedPrn);
        return profileMapper.toProfileSummaryResponse(profile);
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

        return profileMapper.toProfileResponseList(profiles);
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

//    @Override
//    @Transactional(readOnly = true)
//    public ProfileExistenceResponse checkProfileExistsByUserId(Long userId) {
//        log.debug("Checking profile existence by UserId: {}", userId);
//
//        if (userId == null || userId <= 0) {
//            throw new IllegalArgumentException("User ID must be positive");
//        }
//
//        boolean exists = profileRepository.existsByUserId(userId);
//        log.debug("Profile exists for UserId {}: {}", userId, exists);
//
//        return ProfileExistenceResponse.builder()
//                .userId(userId)
//                .exists(exists)
//                .message(exists ? "Profile exists" : "Profile does not exist")
//                .build();
//    }

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

        // Check userId uniqueness
//        if (profileRepository.existsByUserId(request.getUserId())) {
//            errors.add(ValidationError.builder()
//                    .field("userId")
//                    .message("User ID already has a profile")
//                    .rejectedValue(request.getUserId().toString())
//                    .build());
//        }

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
        Map<String, Long> deptMap = results.stream()
                .collect(Collectors.toMap(
                        arr -> (String) arr[0],
                        arr -> (Long) arr[1]
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

    // ========== Private Helper Methods for Batch Operations ==========

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

        List<UserProfile> resp = profileRepository.findByPrnIn(prns);
        return profileMapper.toProfileResponseList(resp);
    }


}
