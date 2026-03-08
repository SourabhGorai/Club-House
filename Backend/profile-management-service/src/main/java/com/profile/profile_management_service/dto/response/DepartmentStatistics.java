package com.profile.profile_management_service.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.Map;

/**
 * DTO for department-wise statistics
 * Maps departmentId to profile count
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DepartmentStatistics implements Serializable {

    /**
     * Map of departmentId to number of profiles in that department
     * Key: departmentId (Long)
     * Value: count of profiles (Long)
     */
    private Map<Long, Long> profilesByDepartment;
}