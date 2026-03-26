package com.clubHouse.tnp.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class AddCompanyRequest {

    @NotNull(message = "Company Name is required")
    private String name;

    @NotNull(message = "Sector is required")
    private String industry;

    @NotNull(message = "Package is required")
    private Double packageOffered;

    @NotNull(message = "Visiting year is required")
    private Integer visitYear; // 2025, 2026

    private Integer academicSession; // 2025 - it will automatically do it to 2025 - 26

    private Integer studentsHired;

}
