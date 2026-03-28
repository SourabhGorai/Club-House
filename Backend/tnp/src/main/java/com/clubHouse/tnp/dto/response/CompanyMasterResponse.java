package com.clubHouse.tnp.dto.response;

import com.clubHouse.tnp.model.Industry;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class CompanyMasterResponse {

    private Long companyMasterId;
    private String name;
    private String industry;
    private String logoUrl;

}
