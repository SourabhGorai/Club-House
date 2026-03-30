package com.clubHouse.tnp.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CompanyStatsDto implements Serializable {
    private Double averagePackage;
    private Long totalStudentsPlaced;
    private Long totalCompaniesVisited;
    private Double highestPackage;
}