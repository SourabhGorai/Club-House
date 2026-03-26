package com.clubHouse.tnp.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BulkUserTnpResponse {

    private int successCount;
    private int failedCount;

    private List<UserTnpResponse> successful;
    private List<FailedEntry> failed;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class FailedEntry {
        private String prn;
        private String role;
        private LocalDateTime startDate;
        private LocalDateTime endDate;
        private String reason;
    }
}