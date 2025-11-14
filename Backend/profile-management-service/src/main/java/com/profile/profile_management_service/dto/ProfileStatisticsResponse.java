package com.profile.profile_management_service.dto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProfileStatisticsResponse {

    private Long totalProfiles;
    private Long activeProfiles;
    private Long inactiveProfiles;
    private Long profilesWithImages;
    private DepartmentStatistics departmentStatistics;
    private YearStatistics yearStatistics;
}