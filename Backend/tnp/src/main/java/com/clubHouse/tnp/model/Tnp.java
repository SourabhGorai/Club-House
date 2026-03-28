package com.clubHouse.tnp.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.io.Serializable;
import java.time.LocalDateTime;

@Data
@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Tnp implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long tnpId;

    @NotNull(message = "Prn is required")
    private String prn;

    @Enumerated(EnumType.STRING)
    private TnpRoles role;

    @NotNull(message = "Start cannot be blank")
    private LocalDateTime startDate;

    @NotNull(message = "End cannot be blank")
    private LocalDateTime endDate;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    @Builder.Default
    private boolean isActive = true;

    public void Activate(){
        this.isActive = true;
    }

    public void Deactivate(){
        this.isActive = false;
    }

}
