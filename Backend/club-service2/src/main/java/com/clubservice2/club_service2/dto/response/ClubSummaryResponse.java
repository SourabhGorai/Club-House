package com.clubservice2.club_service2.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClubSummaryResponse implements Serializable {
    private Long clubId;
    private String clubName;
}
