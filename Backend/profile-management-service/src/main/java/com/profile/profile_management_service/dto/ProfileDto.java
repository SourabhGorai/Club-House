package com.profile.profile_management_service.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProfileDto {

    @NotNull(message = "PRN cannot be null")
    private Long prn;

//    @NotNull(message = "User ID cannot be null")
//    private Long userId;

    @NotBlank(message = "Full name is required")
    private String fullName;

    @NotNull(message = "Department is required")
    private Long departmentId;

    @NotBlank(message = "Year is required")
    private String year;

    private String imagePath;
}
