package com.clubservice2.club_service2.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserClubRequest {

    @NotBlank(message = "PRN is required")
    @Pattern(regexp = "^[A-Z0-9]+$", message = "PRN must contain only uppercase letters and numbers")
    private String prn;

    @NotNull(message = "Club ID is required")
    private Long clubId;

    @NotBlank(message = "Role is required")
    private String role;

    @NotBlank(message = "Tenure is required")
    @Pattern(regexp = "^\\d{4}-\\d{4}$", message = "Tenure must be in format YYYY-YYYY (e.g., 2023-2024)")
    private String tenure;
}
