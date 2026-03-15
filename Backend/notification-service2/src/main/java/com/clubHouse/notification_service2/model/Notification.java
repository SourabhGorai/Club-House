package com.clubHouse.notification_service2.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.io.Serializable;
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
public class Notification implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long notificationId;

    @Enumerated(EnumType.STRING)
    private NotificationType notificationType;

//    @NotNull(message = "Event Id is required")
//    private Long eventId;

    @NotNull(message = "Title required")
    private String title;

    @NotNull(message = "Message required")
    private String message;

    @Enumerated(EnumType.STRING)
    private SourceType sourceType;

    private Long sourceId;

    @NotNull(message = "Target Type is required")
    @Enumerated(EnumType.STRING)
    private TargetType targetType;

    private String createdByPrn;

    private Boolean isActive;  // active or inactive

    private LocalDateTime triggerAt;  // for reminders

    @CreationTimestamp
    private LocalDateTime createdAt;

    private LocalDateTime validUntil;

}
