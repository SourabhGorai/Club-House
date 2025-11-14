package com.profile.profile_management_service.dto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DepartmentStatistics {

    private java.util.Map<String, Long> profilesByDepartment;
}