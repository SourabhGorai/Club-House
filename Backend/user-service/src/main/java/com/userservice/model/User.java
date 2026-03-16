package com.userservice.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.io.Serializable;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "users2",
        indexes = {
                @Index(name = "idx_users2_prn",                        columnList = "prn"),
                @Index(name = "idx_users2_username",                   columnList = "username"),
                @Index(name = "idx_users2_email",                      columnList = "email"),
                @Index(name = "idx_users2_role",                       columnList = "role"),
                @Index(name = "idx_users2_profile_completed",          columnList = "profileCompleted"),
                @Index(name = "idx_users2_is_verified",                columnList = "is_verified"),
                @Index(name = "idx_users2_profile_completed_created_at", columnList = "profileCompleted, createdAt")
        }
)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User implements Serializable {

    @Id
    @Column(nullable = false, unique = true, length = 20)
    @NotBlank(message = "PRN is required")
    @Pattern(regexp = "^[A-Z0-9]{8,20}$", message = "PRN must be 8-20 alphanumeric characters")
    private String prn;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(nullable = false)
    private String password;

    @Column(unique = true)
    private String email;

    @Enumerated(EnumType.STRING)
    private Role role;

    @Column(name = "is_verified")
    private boolean isVerified = false;

    @Column(name = "otp")
    private String otp;

    @Column(name = "otp_expiry")
    private LocalDateTime otpExpiry;

    @NotNull
    private boolean profileCompleted = false;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
}