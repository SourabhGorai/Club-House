package com.clubservice.club_service.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(
        name = "user_club",
        indexes = {
                @Index(name = "idx_user_club_prn", columnList = "prn")
        }
)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserClub {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_club_id")
    private Long id;

    // ---- Relationship with User ----
//    @ManyToOne(fetch = FetchType.LAZY)
//    @JoinColumn(name = "prn", nullable = false)
//    private UserProfile user;

    @Column(name = "prn", nullable = false)
    private String prn;

    // ---- Relationship with Club ----
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "club_id", nullable = false)
    private ClubCreation club;

    // ---- Additional Fields ----
    @Column(nullable = false)
    private String role;

    @Column(nullable = false)
    private String tenure;  // e.g., "2023-2024"
}
