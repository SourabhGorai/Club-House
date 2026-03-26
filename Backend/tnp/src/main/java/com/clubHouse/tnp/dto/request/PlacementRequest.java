package com.clubHouse.tnp.dto.request;
 
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;
 
@Data
public class PlacementRequest {
 
    @NotBlank(message = "Student PRN is required")
    private String studentPrn;
 
    @NotNull(message = "Company ID is required")
    private Long companyId;
 
    @NotBlank(message = "Role is required")
    private String role;
 
    @NotNull(message = "Package offered is required")
    @Positive(message = "Package must be positive")
    private Double packageOffered;
}