package com.clubHouse.notification_service2.repository;

import com.clubHouse.notification_service2.model.Notification;
import com.clubHouse.notification_service2.model.NotificationType;
import com.clubHouse.notification_service2.model.SourceType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    // ── Active / Inactive ─────────────────────────────────────────────────────

    List<Notification> findByIsActiveTrue();
    List<Notification> findByIsActiveFalse();

    Page<Notification> findByIsActiveTrue(Pageable pageable);
    Page<Notification> findByIsActiveFalse(Pageable pageable);

    // ── By Source Type ────────────────────────────────────────────────────────

    List<Notification> findBySourceType(SourceType sourceType);
    Page<Notification> findBySourceType(SourceType sourceType, Pageable pageable);

    // ── By Notification Type ──────────────────────────────────────────────────

    List<Notification> findByNotificationType(NotificationType notificationType);
    Page<Notification> findByNotificationType(NotificationType notificationType, Pageable pageable);

    // ── Cleanup ───────────────────────────────────────────────────────────────

    /**
     * Finds notifications eligible for permanent deletion:
     *
     * Condition A — Expired notifications older than 1 year:
     *   validUntil is set, has passed, AND createdAt is over a year ago
     *
     * Condition B — Deactivated notifications older than 1 year:
     *   manually deactivated (isActive = false) AND createdAt is over a year ago
     *
     * Permanent notifications (validUntil = null) that are still active
     * are intentionally excluded.
     */
    @Query("""
            SELECT n FROM notification_table n
            WHERE n.createdAt < :cutoff
            AND (
                (n.validUntil IS NOT NULL AND n.validUntil < :now)
                OR (n.isActive = false)
            )
            """)
    List<Notification> findEligibleForCleanup(
            @Param("now") LocalDateTime now,
            @Param("cutoff") LocalDateTime cutoff
    );

    @Modifying
    @Query("""
            DELETE FROM notification_table n
            WHERE n.notificationId IN :ids
            """)
    void deleteByIds(@Param("ids") List<Long> ids);

    @Query("""
            SELECT n FROM notification_table n
            WHERE n.sourceType = 'EVENT'
            AND n.sourceId IN :eventIds
            """)
    List<Notification> findEventNotifications(@Param("eventIds") List<Long> eventIds);

    List<Notification> findByCreatedByPrnOrderByCreatedAtDesc(String prn);

    Page<Notification> findByCreatedByPrnOrderByCreatedAtDesc(String prn, Pageable pageable);
}