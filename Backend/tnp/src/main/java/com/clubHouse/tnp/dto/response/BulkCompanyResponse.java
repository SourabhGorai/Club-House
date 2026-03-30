package com.clubHouse.tnp.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Data;

import java.io.Serializable;
import java.util.List;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class BulkCompanyResponse implements Serializable {

    private int totalRequested;
    private int totalAdded;
    private int totalSkipped;           // already existing records
    private List<CompanyResponse> added;
    private List<CompanyResponse> skipped;

}