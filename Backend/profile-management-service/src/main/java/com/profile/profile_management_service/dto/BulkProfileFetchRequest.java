package com.profile.profile_management_service.dto;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
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
    @Size(max = 100, message = "Cannot fetch more than 100 profiles at once")
    private List<String> prns;
}