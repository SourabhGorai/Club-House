package com.clubHouse.notification_service2.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity(name = "user_seen_notification")
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Data
@Table(
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"prn", "notificationId"})
        },
        indexes = {
                @Index(name = "idx_seen_prn", columnList = "prn")
        }
)
public class UserSeenNotification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long seenNotificationId;

    private Long notificationId;

    private String prn;

    private Boolean isRead;

}
