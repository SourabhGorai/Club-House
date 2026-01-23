package com.profile.profile_management_service.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.LocalDateTime;
import java.util.List;

// ============= REQUEST DTOs =============

/**
 * DTO for creating a new user profile
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ProfileCreateRequest {

    @NotBlank(message = "PRN is required")
    @Pattern(regexp = "^[A-Z0-9]{8,20}$", message = "PRN must be 8-20 alphanumeric characters")
    private String prn;

//    @NotNull(message = "User ID is required")
//    @Positive(message = "User ID must be positive")
//    private Long userId;

    @NotBlank(message = "Full name is required")
    @Size(min = 2, max = 100, message = "Full name must be between 2 and 100 characters")
    @Pattern(regexp = "^[a-zA-Z\\s.'-]+$", message = "Full name contains invalid characters")
    private String fullName;

    @NotBlank(message = "Department is required")
    @Size(min = 2, max = 50, message = "Department must be between 2 and 50 characters")
    private String department;

//    @NotNull(message = "Year is required")
    @Min(value = 0, message = "Year must be between 1 and 4. Note: 0 for faculty.")
    @Max(value = 4, message = "Year must be between 1 and 4. Note: 0 for faculty.")
    private Integer year = 0;

    @NotBlank(message = "Phone number is required")
    @Pattern(regexp = "^[0-9]{10,15}$", message = "Phone number must be 10-15 digits")
    private String phoneNumber;
}