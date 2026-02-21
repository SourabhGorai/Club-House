package com.clubHouse.event_service2.mapper;

import com.clubHouse.event_service2.dto.response.EnrollmentResponse;
import com.clubHouse.event_service2.model.EventEnrollment;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.TextStyle;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

@Component
public class EnrollmentMapper {

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

    public static List<EnrollmentResponse> toResponseList(
            List<EventEnrollment> enrollments,
            String prn
    ) {

        if (enrollments == null || enrollments.isEmpty()) {
            return List.of();
        }

        return enrollments.stream()
                .map(enrollment -> toResponse(enrollment, prn))
                .collect(Collectors.toList());
    }


    public static EnrollmentResponse toResponse(EventEnrollment enrollment, String prn) {

        if (enrollment == null) return null;

        return EnrollmentResponse.builder()
                .enrollmentId(enrollment.getEnrollmentId())
                .prn(prn)
                .eventId(enrollment.getEvent().getEventId())
                .createdAt(format(enrollment.getCreatedAt()))
                .build();

    }

    public static List<String> formatList(List<LocalDateTime> times){
        return times.stream()
                .map(EnrollmentMapper::format)
                .collect(Collectors.toList());
    }

    public static String format(LocalDateTime time) {
        return time != null ? time.format(FORMATTER) : null;
    }

    private static String getDay(LocalDateTime time) {
        return time != null
                ? time.getDayOfWeek().getDisplayName(TextStyle.FULL, Locale.ENGLISH)
                : null;
    }

}
