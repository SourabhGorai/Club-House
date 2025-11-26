package com.clubservice2.club_service2.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClubSummaryResponse {
    private Long clubId;
    private String clubName;
}
