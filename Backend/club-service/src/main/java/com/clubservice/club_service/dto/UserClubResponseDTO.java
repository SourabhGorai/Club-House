package com.clubservice.club_service.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserClubResponseDTO {
    private Long userClubId;
    private String prn;
    private Long clubId;
    private String clubName;
    private String role;
    private String tenure;
}
