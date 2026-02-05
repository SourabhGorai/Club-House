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

    public static List<EventResponse> toResponseList(
            List<Events> events,
            String prn,
            String name
    ) {

        if (events == null || events.isEmpty()) {
            return List.of();
        }

        return events.stream()
                .map(event -> toResponse(event, prn, name))
                .collect(Collectors.toList());
    }

    public static EventResponse toResponse(Events event, String prn, String creatorName) {

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
                .venue(event.getVenue())
                .isCompleted(event.isCompleted())
                .enrollmentDeadline(event.getEnrollmentDeadline())
                .enrollmentStatus(event.getEnrollmentStatus())
                .build();

    }

    private static String format(LocalDateTime time) {
        return time != null ? time.format(FORMATTER) : null;
    }

    private static String getDay(LocalDateTime time) {
        return time != null
                ? time.getDayOfWeek().getDisplayName(TextStyle.FULL, Locale.ENGLISH)
                : null;
    }



}
