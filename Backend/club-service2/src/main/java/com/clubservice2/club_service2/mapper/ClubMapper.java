package com.clubservice2.club_service2.mapper;

import com.clubservice2.club_service2.dto.response.ClubResponse;
import com.clubservice2.club_service2.dto.response.ClubSummaryResponse;
import com.clubservice2.club_service2.model.Club;
import org.springframework.stereotype.Component;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class ClubMapper {

    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("dd-MM-yyyy HH:mm:ss");

    public static ClubResponse toResponse(Club club) {
        if (club == null) {
            return null;
        }

        return ClubResponse.builder()
                .clubId(club.getClubId())
                .clubName(club.getClubName())
                .clubDesc(club.getClubDesc())
                .createdAt(club.getCreatedAt() != null ? club.getCreatedAt().format(FORMATTER) : null)
                .deletedAt(club.getDeletedAt() != null ? club.getDeletedAt().format(FORMATTER) : null)
                .isActive(club.getIsActive())
                .build();
    }

    public static List<ClubResponse> toResponseList(List<Club> clubs) {
        if (clubs == null || clubs.isEmpty()) {
            return List.of();
        }
        return clubs.stream()
                .map(ClubMapper::toResponse)
                .collect(Collectors.toList());
    }

    public static ClubSummaryResponse toSummaryResponse(Club club) {
        if (club == null) {
            return null;
        }

        return ClubSummaryResponse.builder()
                .clubId(club.getClubId())
                .clubName(club.getClubName())
                .build();
    }

    public static List<ClubSummaryResponse> toSummaryResponseList(List<Club> clubs) {
        if (clubs == null || clubs.isEmpty()) {
            return List.of();
        }
        return clubs.stream()
                .map(ClubMapper::toSummaryResponse)
                .collect(Collectors.toList());
    }

    /**
     * Sanitizes club name by:
     * - Trimming whitespace
     * - Normalizing multiple spaces to single space
     * - Removing special characters
     * - Converting to uppercase
     */
    public static String sanitizeClubName(String name) {
        if (name == null || name.isBlank()) {
            return null;
        }

        return name.trim()
                .replaceAll("\\s+", " ")
                .replaceAll("[^a-zA-Z0-9 ]", "")
                .toUpperCase();
    }
}
