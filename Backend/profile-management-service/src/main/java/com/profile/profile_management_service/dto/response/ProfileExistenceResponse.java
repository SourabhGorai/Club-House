package com.profile.profile_management_service.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProfileExistenceResponse {

    private String prn;
//    private Long userId;
    private Boolean exists;
    private String message;
}