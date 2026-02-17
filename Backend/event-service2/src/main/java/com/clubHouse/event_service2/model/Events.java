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
import java.time.LocalDateTime;

@Data
@Entity
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Table(name = "events2")
public class Events {
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

    // ========== NEW FIELDS FOR ATTENDANCE ==========

    // Location for geofencing
    private Double latitude;
    private Double longitude;
    private Integer radiusInMeters = 50; // Default 100m

    // Attendance window
    private LocalDateTime attendanceWindowStart;
    private LocalDateTime attendanceWindowEnd;

    // QR Code settings
    private String qrSecretKey; // Generated when attendance starts
    private Integer qrRefreshIntervalSeconds = 120; // Default 2 minutes

    // Attendance status
    private boolean attendanceEnabled = false;
    private boolean attendanceActive = false;

    // ================================================

    public void complete(){
        this.isCompleted = true;
    }

    // New helper methods
    public void startAttendance() {
        this.attendanceActive = true;
    }

    public void stopAttendance() {
        this.attendanceActive = false;
    }
}