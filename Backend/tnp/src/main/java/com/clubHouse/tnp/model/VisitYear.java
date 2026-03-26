package com.clubHouse.tnp.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
public class VisitYear {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long yearId;

    @Column(nullable = false, unique = true)
    private String academicSession;

    @CreationTimestamp
    private LocalDateTime createdAt;

    public static String generateAcademicSession(Integer year) {
        int nextYearShort = (year + 1) % 100;
        return year + "-" + String.format("%02d", nextYearShort);
    }


}