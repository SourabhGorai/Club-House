package com.clubservice2.club_service2.dto.response;

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
public class UserClubResponse {
    private Long userClubId;
    private String prn;
    private Long clubId;
    private String clubName;
    private String role;
    private String tenure;

    // Profile enrichment fields
    private String name;
    private Integer year;
    private String department;
    private String imageUrl;
}