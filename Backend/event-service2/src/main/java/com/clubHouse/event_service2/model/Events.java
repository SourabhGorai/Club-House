package com.clubHouse.event_service2.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.io.Serializable;
import java.time.LocalDateTime;

@Data
@Entity
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Table(
        name = "events2",
        indexes = {
                // ── Single-column indexes ──────────────────────────────────────────────
                // Used by: getByEventCreator(), getMyEvents(), cleanup scheduler (deleteByEventCreator)
                @Index(name = "idx_events_event_creator",   columnList = "eventCreator"),

                // Used by: getByTargetType(), getByTargetData()
                @Index(name = "idx_events_target",          columnList = "target"),

                // Used by: getByOrganizer()
                @Index(name = "idx_events_organizer",       columnList = "organizer"),

                // Used by: getByEnrollmentStatus() — often queried alone
                @Index(name = "idx_events_enrollment_status", columnList = "enrollmentStatus"),

                // Used by: getByStatus() / markEventsComplete scheduler
                @Index(name = "idx_events_is_completed",    columnList = "isCompleted"),

                // Used by: EventCleanupScheduler (findEventIdsCreatedBefore)
                @Index(name = "idx_events_created_at",      columnList = "createdAt"),

                // ── Composite indexes ──────────────────────────────────────────────────
                // Used by: closeExpiredEnrollments scheduler
                //   WHERE enrollmentStatus = 'OPEN' AND enrollmentDeadline < now
                //   Most selective filter first (enrollmentStatus), then range filter.
                @Index(name = "idx_events_enrollment_status_deadline",
                        columnList = "enrollmentStatus, enrollmentDeadline"),

                // Used by: markEventsComplete scheduler
                //   WHERE isCompleted = false AND eventDate < threshold
                @Index(name = "idx_events_completed_event_date",
                        columnList = "isCompleted, eventDate"),

                // Used by: AttendanceSchedular — closeExpiredAttendanceWindows()
                //   WHERE attendanceActive = true AND attendanceWindowEnd < now
                @Index(name = "idx_events_attendance_active_window_end",
                        columnList = "attendanceActive, attendanceWindowEnd"),

                // Used by: AttendanceService — findByAttendanceEnabledAndAttendanceActive()
                //   WHERE attendanceEnabled = true AND attendanceActive = true
                @Index(name = "idx_events_attendance_enabled_active",
                        columnList = "attendanceEnabled, attendanceActive"),

                // Used by: enrollment deadline range queries that also filter by status
                //   Covers both the scheduler and any future filtered-list queries.
                @Index(name = "idx_events_creator_completed",
                        columnList = "eventCreator, isCompleted"),
        }
)
public class Events implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long eventId;

    @NotNull(message = "Title is required")
    private String title;

    private String description;
    private String speakerName;

    @NotNull(message = "Event Date is required")
    private LocalDateTime eventDate;

    private String organizer;
    private String eventCreator;
    private String venue;

    private Integer maxEnrollments;
    private int currEnrollments = 0;

    @Enumerated(EnumType.STRING)
    private TargetType target;

    private boolean isCompleted = false;

    @NotNull(message = "Enrollment Deadline is required")
    private LocalDateTime enrollmentDeadline;

    private String enrollmentStatus = "OPEN";

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    // ── Attendance fields ──────────────────────────────────────────────────────

    private Double latitude;
    private Double longitude;
    private Integer radiusInMeters = 50;

    private LocalDateTime attendanceWindowStart;
    private LocalDateTime attendanceWindowEnd;

    private String qrSecretKey;
    private Integer qrRefreshIntervalSeconds = 120;

    private boolean attendanceEnabled = false;
    private boolean attendanceActive  = false;

    // ── Helpers ────────────────────────────────────────────────────────────────

    public void complete() {
        this.isCompleted = true;
    }

    public void startAttendance() {
        this.attendanceActive = true;
    }

    public void stopAttendance() {
        this.attendanceActive = false;
    }
}