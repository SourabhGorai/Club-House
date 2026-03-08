package com.profile.profile_management_service.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ImageMetadataResponse implements Serializable {

    private String prn;
    private Boolean hasImage;
    private String imageType;
    private Long imageSize;
    private LocalDateTime uploadedAt;
    private String imageUrl;
}