package com.clubHouse.tnp.repository;

import com.clubHouse.tnp.model.Company;
import com.clubHouse.tnp.model.Industry;
import com.clubHouse.tnp.model.VisitYear;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface CompanyRepository extends JpaRepository<Company, Long> {

    // ── Duplicate check ───────────────────────────────────────────────────────
    Company findByNameAndPackageOfferedAndAcademicSession(
            String name,
            Double packageOffered,
            VisitYear academicSession
    );

    // ── Non-paged ─────────────────────────────────────────────────────────────
    List<Company> findAllByOrderByCreatedAtDesc();

    List<Company> findByName(String name);

    List<Company> findByIndustry(Industry industry);

    List<Company> findByAcademicSession(VisitYear academicSession);

    List<Company> findByStudentsHired(Integer studentsHired);

    List<Company> findByStudentsHiredGreaterThanEqual(Integer minStudentsHired);

    @Query("""
        SELECT c FROM Company c 
        WHERE c.packageOffered BETWEEN :min AND :max 
        ORDER BY c.packageOffered ASC
    """)
    List<Company> findByPackageRange(@Param("min") Double min,
                                     @Param("max") Double max);

    @Query("""
        SELECT c FROM Company c 
        WHERE c.academicSession = :academicSession 
        AND c.packageOffered BETWEEN :min AND :max 
        ORDER BY c.packageOffered DESC
    """)
    List<Company> findByAcademicSessionAndPackageRange(
            @Param("academicSession") VisitYear academicSession,
            @Param("min") Double min,
            @Param("max") Double max
    );

    @Query("""
        SELECT c FROM Company c 
        WHERE c.academicSession = :academicSession 
        AND c.industry = :industry
    """)
    List<Company> findByAcademicSessionAndIndustry(
            @Param("academicSession") VisitYear academicSession,
            @Param("industry") Industry industry
    );

    @Query("""
        SELECT c FROM Company c 
        WHERE c.academicSession = :academicSession 
        AND c.studentsHired >= :minHired 
        ORDER BY c.studentsHired DESC
    """)
    List<Company> findByAcademicSessionAndMinStudentsHired(
            @Param("academicSession") VisitYear academicSession,
            @Param("minHired") Integer minHired
    );

    // ── Paged ─────────────────────────────────────────────────────────────────
    Page<Company> findAll(Pageable pageable);

    Page<Company> findByNameContainingIgnoreCase(String name, Pageable pageable);

    Page<Company> findByIndustry(Industry industry, Pageable pageable);

    Page<Company> findByAcademicSession(VisitYear academicSession, Pageable pageable);

    Page<Company> findByStudentsHired(Integer studentsHired, Pageable pageable);

    Page<Company> findByStudentsHiredGreaterThanEqual(Integer minStudentsHired, Pageable pageable);

    @Query("""
        SELECT c FROM Company c 
        WHERE c.packageOffered BETWEEN :min AND :max 
        ORDER BY c.packageOffered ASC
    """)
    Page<Company> findByPackageRange(@Param("min") Double min,
                                     @Param("max") Double max,
                                     Pageable pageable);

    @Query("""
        SELECT c FROM Company c 
        WHERE c.academicSession = :academicSession 
        AND c.packageOffered BETWEEN :min AND :max 
        ORDER BY c.packageOffered DESC
    """)
    Page<Company> findByAcademicSessionAndPackageRange(
            @Param("academicSession") VisitYear academicSession,
            @Param("min") Double min,
            @Param("max") Double max,
            Pageable pageable
    );

    @Query("""
        SELECT c FROM Company c 
        WHERE c.academicSession = :academicSession 
        AND c.industry = :industry
    """)
    Page<Company> findByAcademicSessionAndIndustry(
            @Param("academicSession") VisitYear academicSession,
            @Param("industry") Industry industry,
            Pageable pageable
    );

    @Query("""
        SELECT c FROM Company c 
        WHERE c.academicSession = :academicSession 
        AND c.studentsHired >= :minHired 
        ORDER BY c.studentsHired DESC
    """)
    Page<Company> findByAcademicSessionAndMinStudentsHired(
            @Param("academicSession") VisitYear academicSession,
            @Param("minHired") Integer minHired,
            Pageable pageable
    );

    List<Company> findByAcademicSession_AcademicSession(String session);

    @Query("SELECT SUM(c.packageOffered * c.studentsHired) / SUM(c.studentsHired) " +
            "FROM Company c WHERE c.studentsHired IS NOT NULL AND c.studentsHired > 0")
    Double findOverallWeightedAveragePackage();

    @Query("SELECT SUM(c.studentsHired) FROM Company c WHERE c.studentsHired IS NOT NULL")
    Long findTotalStudentsPlaced();

    @Query("SELECT MAX(c.packageOffered) FROM Company c")
    Double findHighestPackage();
}