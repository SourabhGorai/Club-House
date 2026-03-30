package com.clubHouse.tnp.dto.response;

import lombok.Builder;
import lombok.Data;

import java.io.Serializable;
import java.util.List;

@Data
@Builder
public class BulkPlacementResponse implements Serializable {
    private int totalRequested;
    private int successCount;
    private int failureCount;
    private List<PlacementResponse> succeeded;
    private List<BulkPlacementFailure> failed;

    @Data
    @Builder
    public static class BulkPlacementFailure implements Serializable{
        private String studentPrn;
        private Long companyId;
        private String reason;
    }
}