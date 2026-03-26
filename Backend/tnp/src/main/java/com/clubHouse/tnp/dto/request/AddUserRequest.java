package com.clubHouse.tnp.dto.request;

import com.clubHouse.tnp.model.TnpRoles;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.cglib.core.Local;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AddUserRequest {

    @NotBlank(message = "PRN is required")
    @Pattern(regexp = "^[A-Z0-9]+$", message = "PRN must contain only uppercase letters and numbers")
    private String prn;

    @NotBlank(message = "Role is required")
    private TnpRoles role;

    @NotBlank(message = "startDate is required")
    private LocalDateTime startDate;

    @NotBlank(message = "End Date is required")
    private LocalDateTime endDate;
}
