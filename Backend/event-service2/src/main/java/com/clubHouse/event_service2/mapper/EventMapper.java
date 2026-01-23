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


    /**
     * Convert list of events to responses with profile map
     */
    public static List<EventResponse> toResponseList(
            List<Events> events,
            Map<String, String> organizerNamesMap
    ) {
        if (events == null || events.isEmpty()) {
            return List.of();
        }

        return events.stream()
                .map(event -> {
                    String organizerName = organizerNamesMap.getOrDefault(
                            event.getOrganizer(),
                            event.getOrganizer() // Fallback to PRN
                    );
                    return toResponse(event, event.getOrganizer(), organizerName);
                })
                .collect(Collectors.toList());
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

    public static EventResponse toResponse(Events event, String prn, String organizerName) {

        if (event == null) return null;

        return EventResponse.builder()
                .eventId(event.getEventId())
                .title(event.getTitle())
                .description(event.getDescription())
                .day(getDay(event.getEventDate()))
                .dateTime(format(event.getEventDate()))
                .organizerPrn(prn)
                .organizer(organizerName)
                .venue(event.getVenue())
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
