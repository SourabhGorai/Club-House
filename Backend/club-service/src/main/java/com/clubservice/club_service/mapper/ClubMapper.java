package com.clubservice.club_service.mapper;

import com.clubservice.club_service.dto.ClubResponseDTO;
import com.clubservice.club_service.dto.UserClubResponseDTO;
import com.clubservice.club_service.dto.publicClubView;
import com.clubservice.club_service.model.ClubCreation;
import com.clubservice.club_service.model.UserClub;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Component
public class ClubMapper {
    public static String sanitize(String name) {
        if (name == null) return null;

        // Trim leading/trailing whitespace
        name = name.trim();

        // Normalize internal multiple spaces → single space
        name = name.replaceAll("\\s+", " ");

        // Remove unwanted characters (allow letters, digits, spaces)
        name = name.replaceAll("[^a-zA-Z0-9 ]", "");

        // Convert to Title Case ("tech club" → "Tech Club")
        return toUpperCase(name);
    }

    private static String toUpperCase(String input) {
        if (input == null) {
            return null;
        }
        return input.toUpperCase();
    }
    /**
     * Convert to Title Case
     */
    private static String toTitleCase(String input) {
        StringBuilder result = new StringBuilder();
        for (String word : input.split(" ")) {
            if (word.isEmpty()) continue;
            result.append(Character.toUpperCase(word.charAt(0)))
                    .append(word.substring(1).toLowerCase())
                    .append(" ");
        }
        return result.toString().trim();
    }

    private static final DateTimeFormatter FORMATTER =
            DateTimeFormatter.ofPattern("dd-MM-yyyy HH:mm:ss");

    public static ClubResponseDTO toClubResponse(ClubCreation club) {
        if (club == null) {
            log.warn("Attempted to map null ClubCreation to ClubResponseDTO");
            return null;
        }

        return ClubResponseDTO.builder()
                .clubId(club.getClubId())
                .clubName(club.getClubName())
                .createdAtFormatted(
                        club.getCreatedAt() != null ?
                                club.getCreatedAt().format(FORMATTER) : null
                )
                .deletedAtFormatted(
                        club.getDeletedAt() != null ?
                                club.getDeletedAt().format(FORMATTER) : null
                )
                .isActive(club.getIsActive())
                .build();
    }

    // Convert list of clubs
    public static List<ClubResponseDTO> toClubResponseList(List<ClubCreation> list) {
        if (list == null || list.isEmpty()) {
            log.warn("Attempted to map empty/null club list");
            return List.of();
        }

        return list.stream()
                .map(ClubMapper::toClubResponse)
                .collect(Collectors.toList());
    }

    // --- Single object mapping ---
    public static publicClubView toPublicClubView(ClubCreation club) {
        if (club == null) return null;

        return publicClubView.builder()
                .clubId(club.getClubId())
                .clubName(club.getClubName())
                .build();
    }

    // --- List mapping ---
    public static List<publicClubView> toPublicClubViewList(List<ClubCreation> clubs) {
        return clubs.stream()
                .map(ClubMapper::toPublicClubView)
                .collect(Collectors.toList());
    }

    public static UserClubResponseDTO toResponse(UserClub userClub) {
        return UserClubResponseDTO.builder()
                .userClubId(userClub.getId())
                .prn(userClub.getPrn())
                .clubId(userClub.getClub().getClubId())
                .clubName(userClub.getClub().getClubName())
                .role(userClub.getRole())
                .tenure(userClub.getTenure())
                .build();
    }
}
