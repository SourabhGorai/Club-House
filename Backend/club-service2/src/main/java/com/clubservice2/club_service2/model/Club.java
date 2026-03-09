package com.clubservice2.club_service2.model;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.io.Serializable;
import java.time.LocalDateTime;

@Entity
@Table(name = "clubs", indexes = {
        @Index(name = "idx_club_name", columnList = "club_name"),
        @Index(name = "idx_active", columnList = "is_active")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Club implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "club_id")
    private Long clubId;

    @NotBlank(message = "Club name cannot be blank")
    @Size(min = 2, max = 100, message = "Club name must be between 2 to 100 characters")
    @Column(name = "club_name", nullable = false, unique = true, length = 100)
    private String clubName;

    @NotBlank(message = "Club description required")
    @Size(min = 2, max = 200, message = "Club description must be between 2 to 100 characters")
    @Column(name = "club_desc", nullable = false)
    private String clubDesc;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @Builder.Default
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;
}
