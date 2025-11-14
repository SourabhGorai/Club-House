package com.profile.profile_management_service.dto;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ImageUploadRequest {

    @NotBlank(message = "PRN is required")
    private String prn;

    private String imageType;
    private Long imageSize;
}