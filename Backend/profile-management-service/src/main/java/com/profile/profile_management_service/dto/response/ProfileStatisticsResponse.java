package com.profile.profile_management_service.dto.response;
import com.profile.profile_management_service.dto.YearStatistics;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProfileStatisticsResponse implements Serializable {

    private Long totalProfiles;
    private Long activeProfiles;
    private Long inactiveProfiles;
    private Long profilesWithImages;
    private DepartmentStatistics departmentStatistics;
    private YearStatistics yearStatistics;
}