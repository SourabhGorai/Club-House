package com.clubHouse.tnp.dto.request;

import com.clubHouse.tnp.model.TnpRoles;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AddUserRequest {

    @NotBlank(message = "PRN is required")
    @Pattern(regexp = "^[A-Z0-9]+$", message = "PRN must contain only uppercase letters and numbers")
    private String prn;

    @NotNull(message = "Role is required")
    private TnpRoles role;

    @NotNull(message = "startDate is required")
    private LocalDateTime startDate;

    @NotNull(message = "End Date is required")
    private LocalDateTime endDate;
}
