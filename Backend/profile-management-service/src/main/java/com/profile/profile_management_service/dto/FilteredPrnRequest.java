package com.profile.profile_management_service.dto;

import lombok.Data;

import java.util.List;

@Data
public class FilteredPrnRequest {
    private List<String> prns;
    private Integer year;
}
