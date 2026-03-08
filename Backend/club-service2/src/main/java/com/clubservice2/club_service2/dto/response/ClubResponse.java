package com.clubservice2.club_service2.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ClubResponse implements Serializable {
    private Long clubId;
    private String clubName;
    private String clubDesc;
    private String createdAt;
    private String deletedAt;
    private Boolean isActive;
}