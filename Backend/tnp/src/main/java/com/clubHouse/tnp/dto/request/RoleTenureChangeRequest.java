package com.clubHouse.tnp.dto.request;

import com.clubHouse.tnp.model.TnpRoles;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class RoleTenureChangeRequest {

    @NotNull
    private String prn;

    @NotNull
    private TnpRoles newRole;

    @NotNull
    private LocalDateTime startDate;

    @NotNull
    private LocalDateTime endDate;

}
