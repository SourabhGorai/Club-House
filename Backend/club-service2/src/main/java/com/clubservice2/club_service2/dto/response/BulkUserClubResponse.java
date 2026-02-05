package com.clubservice2.club_service2.dto.response;

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
public class BulkUserClubResponse {
    
    private Integer totalRequested;
    private Integer successCount;
    private Integer failedCount;
    private List<UserClubResponse> successfulAssociations;
    private List<BulkUserClubError> errors;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class BulkUserClubError {
        private String prn;
        private Long clubId;
        private String clubName;
        private String role;
        private String tenure;
        private String errorMessage;
        private String errorType; // USER_NOT_FOUND, CLUB_NOT_FOUND, DUPLICATE_ASSOCIATION, VALIDATION_ERROR, etc.
    }
}