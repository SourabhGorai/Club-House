package com.profile.profile_management_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BatchOperationResponse {

    private Integer totalRequests;
    private Integer successCount;
    private Integer failureCount;
    private List<BatchOperationResult> results;
}