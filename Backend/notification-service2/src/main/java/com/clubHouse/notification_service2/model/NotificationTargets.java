package com.clubHouse.notification_service2.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Data
@Table(
        indexes = {
                @Index(name = "idx_target_type", columnList = "target_type"),
                @Index(name = "idx_target_id", columnList = "target_id"),
                @Index(name = "idx_target_type_id", columnList = "target_type, target_id")
        }
)
public class NotificationTargets implements Serializable {

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
