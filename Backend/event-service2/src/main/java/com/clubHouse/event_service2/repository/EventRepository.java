package com.clubHouse.event_service2.repository;

import com.clubHouse.event_service2.model.Events;
import com.clubHouse.event_service2.model.TargetType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface EventRepository extends JpaRepository<Events, Long> {

    // ── Original (non-paginated — untouched) ─────────────────────────────────
    List<Events> findByOrganizer(String prn);
    List<Events> findByEventCreator(String prn);
    List<Events> findByTarget(TargetType targetType);
    List<Events> findByIsCompleted(boolean status);
    List<Events> findByEnrollmentStatus(String sanitizedStatus);
    List<Long> findEventIdsByEventCreator(String prn);
    int deleteByEventIdIn(List<Long> eventIds);

    @Query("SELECT e.eventId FROM Events e WHERE e.createdAt < :dateTime")
    List<Long> findEventIdsCreatedBefore(@Param("dateTime") LocalDateTime dateTime);

    List<Events> findByEnrollmentStatusAndEnrollmentDeadlineBefore(String status, LocalDateTime deadline);

    // ── Paginated overloads (new) ─────────────────────────────────────────────
    Page<Events> findAll(Pageable pageable);
    Page<Events> findByOrganizer(String prn, Pageable pageable);
    Page<Events> findByEventCreator(String prn, Pageable pageable);
    Page<Events> findByTarget(TargetType targetType, Pageable pageable);
    Page<Events> findByIsCompleted(boolean status, Pageable pageable);
    Page<Events> findByEnrollmentStatus(String sanitizedStatus, Pageable pageable);

    // used by getByRatingsPaged and getByTargetDataPaged
    Page<Events> findAllByEventIdIn(List<Long> ids, Pageable pageable);

    List<Events> findByAttendanceActiveAndAttendanceWindowEndBefore(
            boolean attendanceActive,
            LocalDateTime now
    );

    List<Events> findByIsCompletedAndEventDateBefore(boolean b, LocalDateTime now);
}