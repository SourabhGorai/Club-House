package com.profile.profile_management_service.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

@Data
public class BulkProfileCreateRequest {
    @Valid
    @NotEmpty(message = "Profiles cannot be Empty")
    List<ProfileCreateRequest> profiles;
}
