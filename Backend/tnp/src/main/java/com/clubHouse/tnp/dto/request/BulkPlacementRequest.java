package com.clubHouse.tnp.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;

@Data
public class BulkPlacementRequest {

    @NotEmpty(message = "Placement list must not be empty")
    @Size(max = 200, message = "Cannot process more than 100 placements at once")
    @Valid
    private List<PlacementRequest> placements;
}