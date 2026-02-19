package com.clubHouse.event_service2.mapper;

import com.clubHouse.event_service2.dto.EventResponse;
import com.clubHouse.event_service2.dto.ProfileResponse;
import com.clubHouse.event_service2.model.Events;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.TextStyle;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

@Component
public class EventMapper {

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

    // ── With targetIds ──────────────────────────────────────────────────────────

    public static List<EventResponse> toResponseList(
            List<Events> events,
            String prn,
            String name,
            List<Long> targetIds
    ) {
        if (events == null || events.isEmpty()) {
            return List.of();
        }

        return events.stream()
                .map(event -> toResponse(event, prn, name, targetIds))
                .collect(Collectors.toList());
    }

    public static EventResponse toResponse(
            Events event,
            String prn,
            String creatorName,
            List<Long> targetIds
    ) {
        if (event == null) return null;

        return EventResponse.builder()
                .eventId(event.getEventId())
                .title(event.getTitle())
                .description(event.getDescription())
                .day(getDay(event.getEventDate()))
                .dateTime(format(event.getEventDate()))
                .organizer(event.getOrganizer())
                .creatorPrn(prn)
                .creatorName(creatorName)
                .speakerName(event.getSpeakerName())
                .venue(event.getVenue())
                .maxEnrollments(event.getMaxEnrollments())
                .currEnrollments(event.getCurrEnrollments())
                .isCompleted(event.isCompleted())
                .enrollmentDeadline(event.getEnrollmentDeadline())
                .enrollmentStatus(event.getEnrollmentStatus())
                .targetType(event.getTarget().toString())
                .targetIds(targetIds)
                .latitude(event.getLatitude())
                .longitude(event.getLongitude())
                .radiusInMeters(event.getRadiusInMeters())
                .attendanceWindowStart(event.getAttendanceWindowStart())
                .attendanceWindowEnd(event.getAttendanceWindowEnd())
                .qrRefreshInterval(event.getQrRefreshIntervalSeconds())
                .build();
    }

    // ── Without targetIds (defaults to null) ───────────────────────────────────

    public static List<EventResponse> toResponseList(
            List<Events> events,
            String prn,
            String name
    ) {
        if (events == null || events.isEmpty()) {
            return List.of();
        }

        return events.stream()
                .map(event -> toResponse(event, prn, name, null))
                .collect(Collectors.toList());
    }

    public static EventResponse toResponse(
            Events event,
            String prn,
            String creatorName
    ) {
        return toResponse(event, prn, creatorName, null);
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