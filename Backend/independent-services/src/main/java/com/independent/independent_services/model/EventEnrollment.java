package com.independent.independent_services.model;

import org.springframework.data.annotation.Id;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "enrollment")
public class EventEnrollment {

    @Id
    private String enrollmentId;

    @Indexed
    @NotNull(message = "PRN is required")
    private String prn;

    private List<EventInfo> enrollmentInfo;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EventInfo {

        private Long eventId;
        private LocalDateTime dateTime;
    }

}
