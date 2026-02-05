package com.profile.profile_management_service.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BatchOperationResult {

    private String prn;
    private Boolean success;
    private String message;
    private String errorCode;
}