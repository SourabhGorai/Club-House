package com.profile.profile_management_service.dto.response;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ProfileSummaryResponse implements Serializable {

    private String prn;
    private String fullName;
    private String department;
    private Integer year;
    private Boolean hasProfileImage;
}