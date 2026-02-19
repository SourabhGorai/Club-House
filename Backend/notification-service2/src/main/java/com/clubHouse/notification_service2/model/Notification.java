package com.clubHouse.notification_service2.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity(name = "notification_table")
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Data
@Table(
        indexes = {
                @Index(name = "idx_notification_active", columnList = "isActive"),
                @Index(name = "idx_notification_trigger", columnList = "triggerAt"),
                @Index(name = "idx_notification_type", columnList = "notificationType"),
                @Index(name = "idx_notification_created", columnList = "createdAt")
        }
)
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long notificationId;

//    @NotNull(message = "Event Id is required")
    private Long eventId;

    @NotNull(message = "Title required")
    private String title;

    @NotNull(message = "Message required")
    private String message;

    @Enumerated(EnumType.STRING)
    private NotificationType notificationType;

    @Enumerated(EnumType.STRING)
    private SourceType sourceType;

    private Long sourceId;

    private String createdByPrn;

    private Boolean isActive;  // active or inactive

    private LocalDateTime triggerAt;  // for reminders

    @CreationTimestamp
    private LocalDateTime createdAt;

    private LocalDate validUntil;

}
