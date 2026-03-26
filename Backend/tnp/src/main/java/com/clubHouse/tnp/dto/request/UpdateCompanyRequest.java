package com.clubHouse.tnp.dto.request;

import lombok.Data;

@Data
public class UpdateCompanyRequest {
    private String name;
    private String industry;
    private Double packageOffered;
    private Integer academicSession;
    private Integer studentsHired;
}