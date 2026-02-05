package com.clubservice2.club_service2.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ClubRequest {
    @NotNull(message = "Club name is require")
    private String name;
    @NotNull(message = "Club description is require")
    private String clubDesc;
}
