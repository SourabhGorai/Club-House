package com.clubHouse.tnp.dto.response;
 
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Data;
 
@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class PlacementStatsResponse {
    private String academicSession;
    private long totalPlacements;
    private Double averagePackage;
    private Double highestPackage;
}