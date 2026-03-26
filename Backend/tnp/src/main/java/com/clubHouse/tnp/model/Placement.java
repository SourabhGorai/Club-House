package com.clubHouse.tnp.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Placement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long placementId;

    @Column(nullable = false)
    private String studentPrn;

    @ManyToOne
    @JoinColumn(name = "company_id")
    private Company company;

    private String role; // SDE, Analyst, etc.

    private Double packageOffered;

    private LocalDateTime placedAt;
}