package com.clubservice2.club_service2.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClubPrnsResponse {
    private Long clubId;
    private String clubName;
    private Integer totalCount;
    private List<String> prns;
}
