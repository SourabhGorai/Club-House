package com.clubservice2.club_service2.dto.request;

import com.clubservice2.club_service2.model.ClubRoles;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class RoleChangeRequest {
    @NotNull
    private String prn;
    @NotNull
    private Long clubId;
    @NotNull
    private String newRole;

}
