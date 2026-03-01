package com.profile.profile_management_service.repository;

import com.profile.profile_management_service.model.UserProfile;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Repository interface for UserProfile entity
 * Provides database operations for profile management
 */
@Repository
public interface ProfileRepository extends JpaRepository<UserProfile, String>,
        JpaSpecificationExecutor<UserProfile> {

    // ========== Basic Find Operations ==========

    /**
     * Find active profile by PRN
     */
    Optional<UserProfile> findByPrnAndIsActiveTrue(String prn);

    /**
     * Find profile by phone number
     */
    Optional<UserProfile> findByPhoneNumber(String phoneNumber);

    // ========== Existence Check Operations ==========

    /**
     * Check if PRN exists
     */
    boolean existsByPrn(String prn);

    /**
     * Check if phone number exists
     */
    boolean existsByPhoneNumber(String phoneNumber);

    /**
     * Check if active profile exists by PRN
     */
    boolean existsByPrnAndIsActiveTrue(String prn);

    // ========== Department-based Operations ==========

    /**
     * Find all active profiles by department ID
     */
    List<UserProfile> findByDepartmentIdAndIsActiveTrue(Long departmentId);

    /**
     * Find active profiles by department ID with pagination
     */
    Page<UserProfile> findByDepartmentIdAndIsActiveTrue(Long departmentId, Pageable pageable);

    // ========== Year-based Operations ==========

    /**
     * Find all active profiles by year
     */
    List<UserProfile> findByYearAndIsActiveTrue(Integer year);

    /**
     * Find active profiles by year with pagination
     */
    Page<UserProfile> findByYearAndIsActiveTrue(Integer year, Pageable pageable);

    // ========== Combined Filter Operations ==========

    /**
     * Find profiles by department ID and year
     */
    @Query("SELECT p FROM UserProfile p WHERE p.departmentId = :departmentId " +
            "AND p.year = :year AND p.isActive = true")
    List<UserProfile> findByDepartmentIdAndYear(@Param("departmentId") Long departmentId,
                                                @Param("year") Integer year);

    /**
     * Find profiles by department ID and year with pagination
     */
    @Query("SELECT p FROM UserProfile p WHERE p.departmentId = :departmentId " +
            "AND p.year = :year AND p.isActive = true")
    Page<UserProfile> findByDepartmentIdAndYear(@Param("departmentId") Long departmentId,
                                                @Param("year") Integer year,
                                                Pageable pageable);

    // ========== Search Operations ==========

    /**
     * Search profiles by name
     */
    @Query("SELECT p FROM UserProfile p WHERE LOWER(p.fullName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) " +
            "AND p.isActive = true")
    List<UserProfile> searchByName(@Param("searchTerm") String searchTerm);

    /**
     * Search profiles by name with pagination
     */
    @Query("SELECT p FROM UserProfile p WHERE LOWER(p.fullName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) " +
            "AND p.isActive = true")
    Page<UserProfile> searchByName(@Param("searchTerm") String searchTerm, Pageable pageable);

    /**
     * Advanced search across multiple fields (name and PRN only, since department is now an ID)
     */
    @Query("SELECT p FROM UserProfile p WHERE " +
            "(LOWER(p.fullName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) " +
            "OR LOWER(p.prn) LIKE LOWER(CONCAT('%', :searchTerm, '%'))) " +
            "AND p.isActive = true")
    Page<UserProfile> advancedSearch(@Param("searchTerm") String searchTerm, Pageable pageable);

    // ========== Bulk Operations ==========

    /**
     * Find profiles by list of PRNs
     */
    @Query("SELECT p FROM UserProfile p WHERE p.prn IN :prns AND p.isActive = true")
    List<UserProfile> findByPrnIn(@Param("prns") List<String> prns);

    // ========== Statistics Operations ==========

    /**
     * Count active profiles
     */
    @Query("SELECT COUNT(p) FROM UserProfile p WHERE p.isActive = true")
    Long countActiveProfiles();

    /**
     * Count profiles by department ID
     */
    @Query("SELECT COUNT(p) FROM UserProfile p WHERE p.departmentId = :departmentId " +
            "AND p.isActive = true")
    Long countByDepartmentId(@Param("departmentId") Long departmentId);

    /**
     * Count profiles by year
     */
    @Query("SELECT COUNT(p) FROM UserProfile p WHERE p.year = :year AND p.isActive = true")
    Long countByYear(@Param("year") Integer year);

    /**
     * Count profiles with images
     */
    @Query("SELECT COUNT(p) FROM UserProfile p WHERE p.profileImage IS NOT NULL " +
            "AND p.isActive = true")
    Long countProfilesWithImages();

    /**
     * Get department-wise profile count (returns departmentId and count)
     */
    @Query("SELECT p.departmentId, COUNT(p) FROM UserProfile p WHERE p.isActive = true " +
            "GROUP BY p.departmentId")
    List<Object[]> getDepartmentStatistics();

    /**
     * Get year-wise profile count
     */
    @Query("SELECT p.year, COUNT(p) FROM UserProfile p WHERE p.isActive = true " +
            "GROUP BY p.year ORDER BY p.year")
    List<Object[]> getYearStatistics();

    // ========== Image-related Operations ==========

    /**
     * Find profiles with images
     * Returns full entities - image data will be lazily loaded if needed
     */
    List<UserProfile> findByProfileImageIsNotNullAndIsActiveTrue();

    /**
     * Find profiles without images
     */
    List<UserProfile> findByProfileImageIsNullAndIsActiveTrue();

    // ========== All Active Profiles ==========

    /**
     * Find all active profiles
     */
    List<UserProfile> findByIsActiveTrue();

    /**
     * Find all active profiles with pagination
     */
    Page<UserProfile> findByIsActiveTrue(Pageable pageable);

    // ========== Custom Query for Complete Profile Info ==========

    /**
     * Get complete profile information excluding image data
     */
    @Query("SELECT new com.profile.profile_management_service.model.UserProfile(" +
            "p.prn, p.fullName, p.departmentId, p.year, p.phoneNumber, " +
            "null, p.imageType, p.imageSize, p.imageUploadedAt, " +
            "p.createdAt, p.updatedAt, p.isActive, p.version) " +
            "FROM UserProfile p WHERE p.prn = :prn AND p.isActive = true")
    Optional<UserProfile> findProfileWithoutImage(@Param("prn") String prn);

    /**
     * Find PRNs by list of PRNs filtered by year
     */
    @Query("SELECT p.prn FROM UserProfile p " +
            "WHERE p.prn IN :prns " +
            "AND p.year = :year " +
            "AND p.isActive = true")
    List<String> findPrnsByPrnInAndYear(@Param("prns") List<String> prns,
                                        @Param("year") Integer year);

    @Modifying
    @Query("DELETE FROM UserProfile u WHERE u.prn = :prn")
    void deleteByPrn(@Param("prn") String prn);


    /**
     * Deactivates all active profiles created before the specified date
     * Used by scheduled job to mark graduated students as inactive
     *
     * @param createdBefore The cutoff date (profiles created before this will be deactivated)
     * @return Number of profiles deactivated
     */
    @Modifying
    @Query("UPDATE UserProfile u SET u.isActive = false, u.updatedAt = CURRENT_TIMESTAMP " +
            "WHERE u.createdAt < :createdBefore AND u.isActive = true")
    int deactivateProfilesOlderThan(@Param("createdBefore") LocalDateTime createdBefore);

    List<String> findByIsActiveFalse();

    /**
     * Find only newly deactivated profiles that haven't been cleaned up yet
     */
    @Query("SELECT u.prn FROM UserProfile u WHERE u.isActive = false AND u.dataCleanedUp = false")
    List<String> findNewlyExpiredProfiles();

    /**
     * Mark profiles as cleaned up after event deletion
     */
    @Modifying
    @Query("UPDATE UserProfile u SET u.dataCleanedUp = true, u.dataCleanedUpAt = CURRENT_TIMESTAMP " +
            "WHERE u.prn IN :prns")
    int markProfilesAsCleanedUp(@Param("prns") List<String> prns);


}