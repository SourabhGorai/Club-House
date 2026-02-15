package com.clubHouse.event_service2.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QRCodeResponse {
    
    private String qrToken;
    private LocalDateTime expiresAt;
    private Integer refreshInSeconds;
    private boolean attendanceActive;
}