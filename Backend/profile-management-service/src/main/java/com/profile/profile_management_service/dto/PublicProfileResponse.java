package com.profile.profile_management_service.dto;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class PublicProfileResponse {

    private String prn;
    private String fullName;
    private String department;
    private Integer year;
    private Boolean hasProfileImage;
    private String imageUrl;

    // Phone number is excluded for privacy
}