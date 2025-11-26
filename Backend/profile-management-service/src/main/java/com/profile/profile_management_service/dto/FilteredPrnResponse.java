package com.profile.profile_management_service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class FilteredPrnResponse {
    private List<String> filteredPrns;
    private Integer count;
}
