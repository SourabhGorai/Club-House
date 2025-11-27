package com.notificationservice.notification_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProfileSummaryResponse {
    private String prn;
    private String fullName;
    private String department;
    private Integer year;
    private Boolean hasProfileImage;
}