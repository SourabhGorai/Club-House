package com.clubservice2.club_service2.dto.response;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonIgnoreProperties(ignoreUnknown = true)
public class ProfileResponse {
    private String prn;
    private String fullName;
    private String department;
    private Integer year;
    private String phoneNumber;
    private Boolean hasProfileImage;
    private String imageUrl;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}