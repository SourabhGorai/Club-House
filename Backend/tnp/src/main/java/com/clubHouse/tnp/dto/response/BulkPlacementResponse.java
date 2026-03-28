package com.clubHouse.tnp.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class BulkPlacementResponse {
    private int totalRequested;
    private int successCount;
    private int failureCount;
    private List<PlacementResponse> succeeded;
    private List<BulkPlacementFailure> failed;

    @Data
    @Builder
    public static class BulkPlacementFailure {
        private String studentPrn;
        private Long companyId;
        private String reason;
    }
}