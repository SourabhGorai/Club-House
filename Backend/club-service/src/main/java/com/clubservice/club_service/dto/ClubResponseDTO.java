package com.clubservice.club_service.dto;

import jdk.jfr.Timespan;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.cglib.core.Local;

import java.sql.Timestamp;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClubResponseDTO {
    private Long clubId;
    private String clubName;
//    private LocalDateTime createdAt;
//    private LocalDateTime deletedAt;
    private String createdAtFormatted;
    private String deletedAtFormatted;
    private Boolean isActive;
}
