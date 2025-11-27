package com.notificationservice.notification_service.dto;
import jakarta.validation.constraints.NotNull;
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
public class BulkMarkReadRequest {

    @NotNull(message = "Notification IDs are required")
    @Size(min = 1, max = 100, message = "Must provide 1-100 notification IDs")
    private List<String> notificationIds;
}