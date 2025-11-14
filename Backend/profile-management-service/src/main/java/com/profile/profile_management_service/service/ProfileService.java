package com.profile.profile_management_service.service;

import com.profile.profile_management_service.dto.*;
import com.profile.profile_management_service.exception.InvalidImageException;
import com.profile.profile_management_service.exception.ProfileAlreadyExistsException;
import com.profile.profile_management_service.exception.ProfileNotFoundException;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * Service interface for Profile Management operations
 * Defines all business logic methods for profile handling
 */
public interface ProfileService {

    // ========== Core CRUD Operations ==========

    /**
     * Create a new user profile
     * @param request Profile creation request with all required details
     * @return Created profile response
     * @throws ProfileAlreadyExistsException if profile already exists
     */
    ProfileResponse createProfile(ProfileCreateRequest request);

    /**
     * Get profile by PRN
     * @param prn Permanent Registration Number
     * @return Profile response
     * @throws ProfileNotFoundException if profile not found
     */
    ProfileResponse getProfileByPrn(String prn);

    /**
     * Get profile by User ID
     * @param userId User ID from user service
     * @return Profile response
     * @throws ProfileNotFoundException if profile not found
     */
    ProfileResponse getProfileByUserId(Long userId);

    /**
     * Update existing profile
     * @param prn PRN of the profile to update
     * @param request Update request with modified fields
     * @return Updated profile response
     * @throws ProfileNotFoundException if profile not found
     */
    ProfileResponse updateProfile(String prn, ProfileUpdateRequest request);

    /**
     * Soft delete a profile
     * @param prn PRN of the profile to delete
     * @throws ProfileNotFoundException if profile not found
     */
    void deleteProfile(String prn);

    // ========== Image Operations ==========

    /**
     * Upload profile image
     * @param prn PRN of the profile
     * @param image Image file (max 500KB)
     * @throws ProfileNotFoundException if profile not found
     * @throws InvalidImageException if image validation fails
     */
    void uploadProfileImage(String prn, MultipartFile image);

    /**
     * Get profile image
     * @param prn PRN of the profile
     * @return Image byte array
     * @throws ProfileNotFoundException if profile or image not found
     */
    byte[] getProfileImage(String prn);

    /**
     * Delete profile image
     * @param prn PRN of the profile
     * @throws ProfileNotFoundException if profile not found
     */
    void deleteProfileImage(String prn);

    /**
     * Get profile image metadata
     * @param prn PRN of the profile
     * @return Image metadata response
     * @throws ProfileNotFoundException if profile not found
     */
    ImageMetadataResponse getImageMetadata(String prn);

    // ========== Query Operations ==========

    /**
     * Get all active profiles
     * @return List of all active profiles
     */
    List<ProfileResponse> getAllProfiles();

    /**
     * Get profiles by department
     * @param department Department name
     * @return List of profiles in the department
     */
    List<ProfileResponse> getProfilesByDepartment(String department);

    /**
     * Get profiles by year
     * @param year Academic year (1-4)
     * @return List of profiles in the year
     */
    List<ProfileResponse> getProfilesByYear(Integer year);

    /**
     * Get profiles by department and year
     * @param department Department name
     * @param year Academic year
     * @return List of filtered profiles
     */
    List<ProfileResponse> getProfilesByDepartmentAndYear(String department, Integer year);

    // ========== Paginated Operations ==========

    /**
     * Get all profiles with pagination
     * @param pageable Pagination parameters
     * @return Paged profile response
     */
    PagedResponse<ProfileResponse> getAllProfilesPaged(Pageable pageable);

    /**
     * Get profiles by department with pagination
     * @param department Department name
     * @param pageable Pagination parameters
     * @return Paged profile response
     */
    PagedResponse<ProfileResponse> getProfilesByDepartmentPaged(String department, Pageable pageable);

    /**
     * Search profiles with pagination
     * @param searchRequest Search criteria
     * @return Paged profile response
     */
    PagedResponse<ProfileResponse> searchProfiles(ProfileSearchRequest searchRequest);

    // ========== Public/Limited Access Operations ==========

    /**
     * Get public profile (limited information)
     * @param prn PRN of the profile
     * @return Public profile response
     * @throws ProfileNotFoundException if profile not found
     */
    PublicProfileResponse getPublicProfile(String prn);

    /**
     * Get profile summary (minimal information)
     * @param prn PRN of the profile
     * @return Profile summary response
     * @throws ProfileNotFoundException if profile not found
     */
    ProfileSummaryResponse getProfileSummary(String prn);

    // ========== Batch Operations ==========

    /**
     * Create multiple profiles in batch
     * @param request Batch profile creation request
     * @return Batch operation response with results
     */
    BatchOperationResponse createProfilesBatch(BatchProfileRequest request);

    /**
     * Get multiple profiles by PRNs
     * @param request Bulk fetch request with PRN list
     * @return List of profiles
     */
    List<ProfileResponse> getProfilesBulk(BulkProfileFetchRequest request);

    // ========== Validation Operations ==========

    /**
     * Check if profile exists by PRN
     * @param prn PRN to check
     * @return Existence response
     */
    ProfileExistenceResponse checkProfileExistsByPrn(String prn);

    /**
     * Check if profile exists by User ID
     * @param userId User ID to check
     * @return Existence response
     */
    ProfileExistenceResponse checkProfileExistsByUserId(Long userId);

    /**
     * Validate profile data
     * @param request Profile creation request
     * @return Validation response
     */
    ValidationResponse validateProfile(ProfileCreateRequest request);

    // ========== Statistics Operations ==========

    /**
     * Get profile statistics
     * @return Profile statistics response
     */
    ProfileStatisticsResponse getProfileStatistics();

    /**
     * Get department-wise statistics
     * @return Department statistics
     */
    DepartmentStatistics getDepartmentStatistics();

    /**
     * Get year-wise statistics
     * @return Year statistics
     */
    YearStatistics getYearStatistics();
}