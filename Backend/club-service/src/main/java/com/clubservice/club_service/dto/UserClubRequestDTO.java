package com.clubservice.club_service.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserClubRequestDTO {
    private String prn;
    private Long clubId;
    private String role;
    private String tenure;
}
