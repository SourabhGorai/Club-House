package com.clubHouse.notification_service2.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Data
@Table(
        indexes = {
                @Index(name = "idx_target_type", columnList = "targetType"),
                @Index(name = "idx_target_value", columnList = "targetValue"),
                @Index(name = "idx_target_type_value", columnList = "targetType, targetValue")
        }
)
public class NotificationTargets {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long notificationTargetId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "notification_id", nullable = false)
    private Notification notification;

    @Enumerated(EnumType.STRING)
    private TargetType targetType;

    private Long targetId;

}
