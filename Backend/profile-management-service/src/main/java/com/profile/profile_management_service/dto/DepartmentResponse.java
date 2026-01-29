
package com.profile.profile_management_service.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class DepartmentResponse {
    private Long departmentId;
    private String name;
    private boolean isActive;
}
