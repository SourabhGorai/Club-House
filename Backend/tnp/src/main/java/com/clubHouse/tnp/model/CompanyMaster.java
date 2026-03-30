package com.clubHouse.tnp.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.io.Serializable;
import java.time.LocalDateTime;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CompanyMaster implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long companyMasterId;

    @NotNull(message = "Company name is required")
    @Column(unique = true)
    private String name;

    @ManyToOne(optional = false)
    @JoinColumn(name = "industry_id")
    private Industry industry;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @NotNull(message = "Logo url is required")
    private String logoUrl;

}
