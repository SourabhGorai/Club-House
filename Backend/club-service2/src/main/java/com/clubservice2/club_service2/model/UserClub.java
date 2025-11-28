package com.clubservice2.club_service2.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.*;

@Entity
@Table(name = "user_clubs2",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_prn_club_role_tenure",
                        columnNames = {"prn", "club_id", "role", "tenure"})
        },
        indexes = {
                @Index(name = "idx_prn", columnList = "prn"),
                @Index(name = "idx_club_id", columnList = "club_id")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserClub {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_club_id")
    private Long id;

    @NotBlank(message = "PRN cannot be blank")
    @Pattern(regexp = "^[A-Z0-9]+$", message = "PRN must contain only uppercase letters and numbers")
    @Column(name = "prn", nullable = false, length = 20)
    private String prn;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "club_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_user_club_club"))
    private Club club;

    @NotBlank(message = "Role cannot be blank")
    @Column(name = "role", nullable = false, length = 50)
    private String role;

    @NotBlank(message = "Tenure cannot be blank")
    @Pattern(regexp = "^\\d{4}-\\d{4}$", message = "Tenure must be in format YYYY-YYYY")
    @Column(name = "tenure", nullable = false, length = 9)
    private String tenure;


}