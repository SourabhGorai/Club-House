package com.userservice.repository;


import com.userservice.model.User;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    boolean existsByUsername(String username);
    Optional<User> findByEmail(String email);
    Optional<User> findByPrn(String prn);
    boolean existsByPrn(String prn);
    void deleteByPrn(String prn);
    @Query("""
            SELECT u FROM User u
            WHERE u.profileCompleted = false
            AND u.createdAt < :cutoff
            """)
    List<User> findIncompleteRegistrations(@Param("cutoff") LocalDateTime cutoff);

    /**
     * Bulk delete by PRN list — used by the scheduler for batch processing.
     */
    @Modifying
    @Query("DELETE FROM User u WHERE u.prn IN :prns")
    int deleteByPrns(@Param("prns") List<String> prns);

    // ── One-time sync queries (run once after adding profileCompleted column) ──

    @Modifying
    @Query("UPDATE User u SET u.profileCompleted = true WHERE u.prn IN :prns")
    int markProfileCreatedTrue(@Param("prns") List<String> prns);

    @Modifying
    @Query("UPDATE User u SET u.profileCompleted = false WHERE u.prn NOT IN :prns")
    int markProfileCreatedFalseExcluding(@Param("prns") List<String> prns);
}