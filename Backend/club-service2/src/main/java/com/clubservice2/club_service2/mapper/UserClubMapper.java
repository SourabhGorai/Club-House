package com.clubservice2.club_service2.mapper;


import com.clubservice2.club_service2.dto.response.ProfileEnrichedUserClubResponse;
import com.clubservice2.club_service2.dto.response.ProfileSummaryResponse;
import com.clubservice2.club_service2.dto.response.UserClubResponse;
import com.clubservice2.club_service2.model.UserClub;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Component
public class UserClubMapper {

    /**
     * Maps UserClub to basic response without profile enrichment
     */
    public static UserClubResponse toResponse(UserClub userClub) {
        if (userClub == null) {
            return null;
        }

        return UserClubResponse.builder()
                .userClubId(userClub.getId())
                .prn(userClub.getPrn())
                .clubId(userClub.getClub().getClubId())
                .clubName(userClub.getClub().getClubName())
                .role(userClub.getRole())
                .tenure(userClub.getTenure())
                .build();
    }

    /**
     * Maps UserClub to profile-enriched response
     */
    public static ProfileEnrichedUserClubResponse toProfileEnrichedResponse(
            UserClub userClub, ProfileSummaryResponse profile) {

        if (userClub == null) {
            return null;
        }

        ProfileEnrichedUserClubResponse.ProfileEnrichedUserClubResponseBuilder builder =
                ProfileEnrichedUserClubResponse.builder()
                        .userClubId(userClub.getId())
                        .prn(userClub.getPrn())
                        .clubId(userClub.getClub().getClubId())
                        .clubName(userClub.getClub().getClubName())
                        .role(userClub.getRole())
                        .tenure(userClub.getTenure());

        if (profile != null) {
            builder.name(profile.getFullName())
                    .department(profile.getDepartment())
                    .year(profile.getYear())
                    .hasProfileImage(profile.getHasProfileImage());
        }

        return builder.build();
    }

    /**
     * Maps list of UserClubs to profile-enriched responses using bulk profiles
     */
    public static List<ProfileEnrichedUserClubResponse> toProfileEnrichedResponseList(
            List<UserClub> userClubs, Map<String, ProfileSummaryResponse> profileMap) {

        if (userClubs == null || userClubs.isEmpty()) {
            return List.of();
        }

        return userClubs.stream()
                .map(userClub -> {
                    ProfileSummaryResponse profile = profileMap.get(userClub.getPrn());
                    return toProfileEnrichedResponse(userClub, profile);
                })
                .collect(Collectors.toList());
    }

    // New overload — used by the 3 targeted endpoints
    public static ProfileEnrichedUserClubResponse toProfileEnrichedResponse(
            UserClub userClub, ProfileSummaryResponse profile, String imageUrl) {

        if (userClub == null) return null;

        ProfileEnrichedUserClubResponse.ProfileEnrichedUserClubResponseBuilder builder =
                ProfileEnrichedUserClubResponse.builder()
                        .userClubId(userClub.getId())
                        .prn(userClub.getPrn())
                        .clubId(userClub.getClub().getClubId())
                        .clubName(userClub.getClub().getClubName())
                        .role(userClub.getRole())
                        .tenure(userClub.getTenure());

        if (profile != null) {
            builder.name(profile.getFullName())
                    .department(profile.getDepartment())
                    .year(profile.getYear())
                    .hasProfileImage(profile.getHasProfileImage())
                    .imageUrl(imageUrl);
        }

        return builder.build();
    }

    // New overload — used by the 3 targeted endpoints
    public static List<ProfileEnrichedUserClubResponse> toProfileEnrichedResponseList(
            List<UserClub> userClubs,
            Map<String, ProfileSummaryResponse> profileMap,
            Map<String, String> imageUrlMap) {

        if (userClubs == null || userClubs.isEmpty()) return List.of();

        return userClubs.stream()
                .map(userClub -> toProfileEnrichedResponse(
                        userClub,
                        profileMap.get(userClub.getPrn()),
                        imageUrlMap.getOrDefault(userClub.getPrn(), null)
                ))
                .collect(Collectors.toList());
    }

    /**
     * Maps list of UserClubs to basic responses without profile enrichment
     */
    public static List<UserClubResponse> toResponseList(List<UserClub> userClubs) {
        if (userClubs == null || userClubs.isEmpty()) {
            return List.of();
        }
        return userClubs.stream()
                .map(UserClubMapper::toResponse)
                .collect(Collectors.toList());
    }

    public static String sanitizeRole(String s) {
        if (s == null || s.isBlank()) {
            return null;
        }

        return s.trim()
                .replaceAll("\\s+", " ")
                .replaceAll("[^a-zA-Z0-9 ]", "_")
                .toUpperCase();
    }
}