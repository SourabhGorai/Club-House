package com.clubHouse.event_service2.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QRCodeResponse implements Serializable {
    
    private String qrToken;
    private LocalDateTime expiresAt;
    private Integer refreshInSeconds;
    private boolean attendanceActive;
}