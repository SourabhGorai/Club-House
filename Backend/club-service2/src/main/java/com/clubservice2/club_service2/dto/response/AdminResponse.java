package com.clubservice2.club_service2.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class AdminResponse {
    private String clubName;
    private String clubDesc;

    // Teacher information
    private String teacherPrn;
    private String teacherName;
    private String teacherDepartment;

    // Club Admin information (can be multiple)
    private List<AdminInfo> clubAdmins;

    private Long totalCount;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class AdminInfo {
        private String prn;
        private String name;
        private String department;
        private int year;
    }
}