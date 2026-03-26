package com.clubHouse.tnp.repository;

import com.clubHouse.tnp.model.Placement;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PlacementRepository extends JpaRepository<Placement, Long> {

    // ── Single lookup ────────────────────────────────────────────────────────

    Optional<Placement> findByStudentPrnAndCompany_CompanyId(String studentPrn, Long companyId);

    // ── By student ───────────────────────────────────────────────────────────

    List<Placement> findByStudentPrn(String studentPrn);

    boolean existsByStudentPrnAndCompany_CompanyId(String studentPrn, Long companyId);

    // ── By company ───────────────────────────────────────────────────────────

    Page<Placement> findByCompany_CompanyId(Long companyId, Pageable pageable);

    // ── By academic session ──────────────────────────────────────────────────

    @Query("""
            SELECT p FROM Placement p
            JOIN FETCH p.company c
            JOIN FETCH c.academicSession s
            WHERE s.academicSession = :session
            """)
    Page<Placement> findByAcademicSession(@Param("session") String academicSession, Pageable pageable);

    // ── By role ──────────────────────────────────────────────────────────────

    Page<Placement> findByRole(String role, Pageable pageable);

    // ── By industry ──────────────────────────────────────────────────────────

    @Query("""
            SELECT p FROM Placement p
            JOIN FETCH p.company c
            JOIN FETCH c.industry i
            WHERE i.industryId = :industryId
            """)
    Page<Placement> findByIndustry(@Param("industryId") Long industryId, Pageable pageable);

    // ── Package range ────────────────────────────────────────────────────────

    Page<Placement> findByPackageOfferedBetween(Double min, Double max, Pageable pageable);

    // ── All with joins (avoids N+1 on list endpoints) ────────────────────────

    @Query(value = """
            SELECT p FROM Placement p
            JOIN FETCH p.company c
            JOIN FETCH c.industry
            JOIN FETCH c.academicSession
            """,
           countQuery = "SELECT COUNT(p) FROM Placement p")
    Page<Placement> findAllWithDetails(Pageable pageable);

    // ── Stats queries ────────────────────────────────────────────────────────

    @Query("""
            SELECT COUNT(p) FROM Placement p
            JOIN p.company c
            JOIN c.academicSession s
            WHERE s.academicSession = :session
            """)
    long countByAcademicSession(@Param("session") String academicSession);

    @Query("""
            SELECT AVG(p.packageOffered) FROM Placement p
            JOIN p.company c
            JOIN c.academicSession s
            WHERE s.academicSession = :session
            """)
    Double avgPackageByAcademicSession(@Param("session") String academicSession);

    @Query("""
            SELECT MAX(p.packageOffered) FROM Placement p
            JOIN p.company c
            JOIN c.academicSession s
            WHERE s.academicSession = :session
            """)
    Double maxPackageByAcademicSession(@Param("session") String academicSession);
}