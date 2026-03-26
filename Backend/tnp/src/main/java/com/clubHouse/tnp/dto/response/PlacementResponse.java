package com.clubHouse.tnp.dto.response;
 
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Data;
 
import java.time.LocalDateTime;
 
@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class PlacementResponse {
 
    private Long placementId;
    private String studentPrn;
 
    // Student info enriched from profile-service (nullable – may be absent)
    private String studentName;
    private String department;
    private Integer year;
 
    // Company snapshot
    private Long companyId;
    private String companyName;
    private String industry;
    private String academicSession;
 
    private String role;
    private Double packageOffered;
    private LocalDateTime placedAt;
}