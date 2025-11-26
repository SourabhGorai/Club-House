package com.profile.profile_management_service.repository;

import com.profile.profile_management_service.model.UserProfile;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

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
     * Find profile by user ID
     */
//    Optional<UserProfile> findByUserId(Long userId);

    /**
     * Find active profile by PRN
     */
    Optional<UserProfile> findByPrnAndIsActiveTrue(String prn);

    /**
     * Find active profile by user ID
     */
//    Optional<UserProfile> findByUserIdAndIsActiveTrue(Long userId);

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
     * Check if user ID exists
     */
//    boolean existsByUserId(Long userId);

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
     * Find all active profiles by department
     */
    List<UserProfile> findByDepartmentAndIsActiveTrue(String department);

    /**
     * Find active profiles by department with pagination
     */
    Page<UserProfile> findByDepartmentAndIsActiveTrue(String department, Pageable pageable);

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
     * Find profiles by department and year
     */
    @Query("SELECT p FROM UserProfile p WHERE p.department = :department " +
            "AND p.year = :year AND p.isActive = true")
    List<UserProfile> findByDepartmentAndYear(@Param("department") String department,
                                              @Param("year") Integer year);

    /**
     * Find profiles by department and year with pagination
     */
    @Query("SELECT p FROM UserProfile p WHERE p.department = :department " +
            "AND p.year = :year AND p.isActive = true")
    Page<UserProfile> findByDepartmentAndYear(@Param("department") String department,
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
     * Advanced search across multiple fields
     */
    @Query("SELECT p FROM UserProfile p WHERE " +
            "(LOWER(p.fullName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) " +
            "OR LOWER(p.prn) LIKE LOWER(CONCAT('%', :searchTerm, '%')) " +
            "OR LOWER(p.department) LIKE LOWER(CONCAT('%', :searchTerm, '%'))) " +
            "AND p.isActive = true")
    Page<UserProfile> advancedSearch(@Param("searchTerm") String searchTerm, Pageable pageable);

    // ========== Bulk Operations ==========

    /**
     * Find profiles by list of PRNs
     */
    @Query("SELECT p FROM UserProfile p WHERE p.prn IN :prns AND p.isActive = true")
    List<UserProfile> findByPrnIn(@Param("prns") List<String> prns);

    /**
     * Find profiles by list of user IDs
     */
//    @Query("SELECT p FROM UserProfile p WHERE p.userId IN :userIds AND p.isActive = true")
//    List<UserProfile> findByUserIdIn(@Param("userIds") List<Long> userIds);

    // ========== Statistics Operations ==========

    /**
     * Count active profiles
     */
    @Query("SELECT COUNT(p) FROM UserProfile p WHERE p.isActive = true")
    Long countActiveProfiles();

    /**
     * Count profiles by department
     */
    @Query("SELECT COUNT(p) FROM UserProfile p WHERE p.department = :department " +
            "AND p.isActive = true")
    Long countByDepartment(@Param("department") String department);

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
     * Get department-wise profile count
     */
    @Query("SELECT p.department, COUNT(p) FROM UserProfile p WHERE p.isActive = true " +
            "GROUP BY p.department")
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
     */
    @Query("SELECT p FROM UserProfile p WHERE p.profileImage IS NOT NULL " +
            "AND p.isActive = true")
    List<UserProfile> findProfilesWithImages();

    /**
     * Find profiles without images
     */
    @Query("SELECT p FROM UserProfile p WHERE p.profileImage IS NULL " +
            "AND p.isActive = true")
    List<UserProfile> findProfilesWithoutImages();

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

//    @Query("SELECT new com.profile.profile_management_service.model.UserProfile(" +
//            "p.prn, p.userId, p.fullName, p.department, p.year, p.phoneNumber, " +
//            "null, p.imageType, p.imageSize, p.imageUploadedAt, " +
//            "p.createdAt, p.updatedAt, p.isActive, p.version) " +
//            "FROM UserProfile p WHERE p.prn = :prn AND p.isActive = true")

    @Query("SELECT new com.profile.profile_management_service.model.UserProfile(" +
            "p.prn, p.fullName, p.department, p.year, p.phoneNumber, " +
            "null, p.imageType, p.imageSize, p.imageUploadedAt, " +
            "p.createdAt, p.updatedAt, p.isActive, p.version) " +
            "FROM UserProfile p WHERE p.prn = :prn AND p.isActive = true")
    Optional<UserProfile> findProfileWithoutImage(@Param("prn") String prn);

    @Query("SELECT p.prn FROM UserProfile p " +
            "WHERE p.prn IN :prns " +
            "AND p.year = :year " +
            "AND p.isActive = true")
    List<String> findPrnsByPrnInAndYear(@Param("prns") List<String> prns,
                                        @Param("year") Integer year);

}