package com.clubHouse.tnp.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class UserTnpResponse implements Serializable {
    private Long tnpId;
    private String prn;
    private String role;
    private LocalDateTime startDate;
    private LocalDateTime endDate;

    // Profile enrichment fields
    private String name;
    private Integer year;
    private String department;
    private String imageUrl;
}