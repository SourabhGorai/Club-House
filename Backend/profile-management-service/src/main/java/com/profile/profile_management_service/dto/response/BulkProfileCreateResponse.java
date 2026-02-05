package com.profile.profile_management_service.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class BulkProfileCreateResponse {
    private Integer totalRequested;
    private Integer successCount;
    private Integer failedCount;
    private List<ProfileResponse> successfulProfiles;
    private List<BulkProfileError> errors;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class BulkProfileError {
        private String prn;
        private String fullName;
        private String errorMessage;
        private String errorType; // VALIDATION_ERROR, USER_NOT_FOUND, DUPLICATE_PROFILE, etc.
    }
}