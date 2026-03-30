package com.clubHouse.tnp.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.List;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class CombinedResponse implements Serializable {

    private Long companyId;
    private String name;
    private String industry;
    private List<Double> packageOffered;
    private String academicSession;
    private Integer studentsHired;

}