package com.clubservice2.club_service2.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FilterPrnsRequest {

    @NotEmpty(message = "PRN list cannot be empty")
    private List<String> prns;

    @NotNull(message = "Year is required")
    private Integer year;
}