package com.clubHouse.tnp.mapper;

import com.clubHouse.tnp.dto.response.ProfileEnrichedUserResponse;
import com.clubHouse.tnp.dto.response.ProfileResponse;
import com.clubHouse.tnp.dto.response.ProfileSummaryResponse;
import com.clubHouse.tnp.dto.response.UserTnpResponse;
import com.clubHouse.tnp.model.Tnp;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.TextStyle;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

@Component
public class TnpMapper {

    private static final DateTimeFormatter FORMATTER =
            DateTimeFormatter.ofPattern("dd-MM-yyyy HH:mm:ss");



    public static UserTnpResponse toResponse(Tnp user){
        if(user == null) return null;

        return UserTnpResponse.builder()
                .tnpId(user.getTnpId())
                .prn(user.getPrn())
                .role(user.getRole().toString())
                .startDate(user.getStartDate())
                .endDate(user.getEndDate())
                .build();
    }

    public static ProfileEnrichedUserResponse toProfileEnrichedResponse(
            Tnp user, ProfileResponse profile
    ) {

        if(user == null) return null;

        ProfileEnrichedUserResponse.ProfileEnrichedUserResponseBuilder builder =
                ProfileEnrichedUserResponse.builder()
                        .tnpId(user.getTnpId())
                        .prn(user.getPrn())
                        .role(user.getRole().toString())
                        .startDate(user.getStartDate())
                        .endDate(user.getEndDate());

        if(profile != null){
            builder.name(profile.getFullName())
                    .department(profile.getDepartment())
                    .year(profile.getYear())
                    .hasProfileImage(profile.getHasProfileImage())
                    .imageUrl(profile.getImageUrl());
        }

        return builder.build();

    }

    public static List<ProfileEnrichedUserResponse> toProfileEnrichedResponseList(
            List<Tnp> users, Map<String, ProfileResponse> profileMap) {

        if (users == null || users.isEmpty()) {
            return List.of();
        }

        return users.stream()
                .map(user -> {
                    ProfileResponse profile = profileMap.get(user.getPrn());
                    return toProfileEnrichedResponse(user, profile);
                })
                .collect(Collectors.toList());
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
