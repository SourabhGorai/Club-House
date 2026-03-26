package com.clubHouse.tnp.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Company {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long companyId;

    @Column(nullable = false)
    private String name;

    @ManyToOne(optional = false)
    @JoinColumn(name = "industry_id")
    private Industry industry;

    @Column(nullable = false)
    private Double packageOffered;

    @ManyToOne(optional = false)
    @JoinColumn(name = "year_id")
    private VisitYear academicSession;

    private Integer studentsHired;

    @CreationTimestamp
    private LocalDateTime createdAt;
}