package com.clubHouse.tnp.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ProfileEnrichedUserResponse implements Serializable {
    // TNP association fields
    private Long tnpId;
    private String prn;
    private String role;
    private LocalDateTime startDate;
    private LocalDateTime endDate;

    // Profile fields from profile-management-service
    private String name;
    private String department;
    private Integer year;
    private Boolean hasProfileImage;
    private String imageUrl;
}