package com.clubservice2.club_service2.dto.request;

import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BulkProfileFetchRequest {
    @NotEmpty(message = "PRN list cannot be empty")
    private List<String> prns;
}