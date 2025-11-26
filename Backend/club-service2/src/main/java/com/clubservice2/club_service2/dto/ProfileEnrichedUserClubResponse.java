package com.clubservice2.club_service2.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ProfileEnrichedUserClubResponse {
    // User-Club association fields
    private Long userClubId;
    private String prn;
    private Long clubId;
    private String clubName;
    private String role;
    private String tenure;

    // Profile fields from profile-management-service
    private String name;
    private String department;
    private Integer year;
    private Boolean hasProfileImage;
}