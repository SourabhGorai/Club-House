package com.clubHouse.event_service2.model;

import jakarta.persistence.*;
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
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(
    name = "attendance",
    uniqueConstraints = {
        @UniqueConstraint(columnNames = {"event_id", "prn"})
    },
    indexes = {
        @Index(name = "idx_attendance_event", columnList = "event_id"),
        @Index(name = "idx_attendance_prn", columnList = "prn"),
        @Index(name = "idx_attendance_status", columnList = "status")
    }
)
public class Attendance implements Serializable {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long attendanceId;
    
    @NotNull(message = "PRN is required")
    @Column(nullable = false)
    private String prn;
    
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "event_id", nullable = false)
    private Events event;
    
    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime markedAt;
    
    // Location data
    private Double userLatitude;
    private Double userLongitude;
    private Double distanceFromVenue; // in meters
    
    // QR validation
    private String qrToken;
    
    // Status
    @Enumerated(EnumType.STRING)
    private AttendanceStatus status = AttendanceStatus.PRESENT;
    
    // Audit fields (optional but recommended)
    private String deviceInfo;
    private String ipAddress;

    private boolean rated = false;
    private Integer ratings;
}