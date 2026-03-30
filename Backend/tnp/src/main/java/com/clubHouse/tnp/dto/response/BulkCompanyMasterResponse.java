package com.clubHouse.tnp.dto.response;

import lombok.Builder;
import lombok.Data;

import java.io.Serializable;
import java.util.List;

@Data
@Builder
public class BulkCompanyMasterResponse implements Serializable {

    private List<CompanyMasterResponse> success;
    private List<FailedCompany> failed;

    @Data
    @Builder
    public static class FailedCompany {
        private String name;
        private String reason;
    }
}