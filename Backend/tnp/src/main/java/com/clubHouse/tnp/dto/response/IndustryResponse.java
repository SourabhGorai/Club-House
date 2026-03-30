package com.clubHouse.tnp.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Data;

import java.io.Serializable;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class IndustryResponse implements Serializable {

    private Long industryId;
    private String name;

}
