package com.clubHouse.event_service2.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Data
@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(
        name = "event_enrollments2",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"event_id", "prn"})
        },
        indexes = {
                @Index(name = "idx_event_id", columnList = "event_id"),
                @Index(name = "idx_prn", columnList = "prn")
        }
)
public class EventEnrollment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long enrollmentId;

    @NotNull(message = "PRN is required")
    @Column(nullable = false)
    private String prn;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "event_id", nullable = false)
    private Events event;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}

