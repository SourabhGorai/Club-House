package com.clubHouse.notification_service2.mapper;

import com.clubHouse.notification_service2.dto.request.NotificationRequest;
import com.clubHouse.notification_service2.dto.response.NotificationResponse;
import com.clubHouse.notification_service2.model.Notification;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.TextStyle;
import java.util.List;
import java.util.Locale;

@Component
public class NotificationMapper {

    private static final DateTimeFormatter FORMATTER =
            DateTimeFormatter.ofPattern("dd-MM-yyyy HH:mm:ss");

    public static String sanitizeName(String departmentName) {
        if (departmentName == null || departmentName.isBlank()) {
            return null;
        }

        return departmentName.trim()
                .replaceAll("\\s+", " ")
                .replaceAll("[^a-zA-Z0-9 ]", "")
                .toUpperCase();
    }


    public NotificationResponse toResponse(
            Notification req,
            String targetType,
            List<Long> targetIds,
            String sourceDetail
    ) {

        if(req == null) return null;

        NotificationResponse resp = NotificationResponse.builder()
                .notificationId(req.getNotificationId())
                .title(req.getTitle())
                .message(req.getMessage())
                .notificationType(req.getNotificationType().toString())
                .sourceType(req.getSourceType().toString())
                .sourceId(req.getSourceId())
                .sourceDetail(sourceDetail)
                .createdByPrn(req.getCreatedByPrn())
                .isActive(req.getIsActive())
                .createdAt(format(req.getCreatedAt()))
                .validUntil(format(req.getValidUntil()))
                .targetType(targetType)
                .targetIds(targetIds)
                .build();

        return null;
    }



    // ── Private helpers ─────────────────────────────────────────────────────────

    private static String format(LocalDateTime time) {
        return time != null ? time.format(FORMATTER) : null;
    }

    private static String getDay(LocalDateTime time) {
        return time != null
                ? time.getDayOfWeek().getDisplayName(TextStyle.FULL, Locale.ENGLISH)
                : null;
    }

}
