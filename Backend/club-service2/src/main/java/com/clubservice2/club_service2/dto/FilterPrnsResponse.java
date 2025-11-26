package com.clubservice2.club_service2.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FilterPrnsResponse {
    private List<String> filteredPrns;
    private Integer count;
}
