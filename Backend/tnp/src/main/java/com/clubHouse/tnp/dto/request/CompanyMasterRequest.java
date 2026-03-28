package com.clubHouse.tnp.dto.request;

import com.clubHouse.tnp.model.Industry;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CompanyMasterRequest {

    @NotNull(message = "Company name is required")
    private String name;

    @NotNull
    private Long industryId;

    @NotNull(message = "Logo url is required")
    private String logoUrl;

}
