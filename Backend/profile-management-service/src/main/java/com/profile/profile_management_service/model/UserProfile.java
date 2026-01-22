package com.profile.profile_management_service.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;

/**
 * Entity class representing user profile in the system
 * PRN (Permanent Registration Number) serves as the primary key
 * Fixed for PostgreSQL BYTEA compatibility
 */
@Entity
@Table(name = "user_profiles2", indexes = {
//        @Index(name = "idx_user_id", columnList = "userId"),
        @Index(name = "idx_department", columnList = "department"),
        @Index(name = "idx_year", columnList = "year"),
        @Index(name = "idx_phone", columnList = "phoneNumber"),
        @Index(name = "idx_active", columnList = "isActive")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserProfile {

    @Id
    @Column(nullable = false, unique = true, length = 20)
    @NotBlank(message = "PRN is required")
    @Pattern(regexp = "^[A-Z0-9]{8,20}$", message = "PRN must be 8-20 alphanumeric characters")
    private String prn;

//    @Column(nullable = false, unique = true)
//    @NotNull(message = "User ID is required")
//    private Long userId;

    @Column(nullable = false, length = 100)
    @NotBlank(message = "Full name is required")
    @Size(min = 2, max = 100, message = "Full name must be between 2 and 100 characters")
    private String fullName;

    @Column(nullable = false, length = 50)
    @NotBlank(message = "Department is required")
    private String department;

    @Column(nullable = false)
    @NotNull(message = "Year is required")
    @Min(value = 0, message = "Year must be between 1 and 4")
    @Max(value = 4, message = "Year must be between 1 and 4")
    private Integer year;

    @Column(nullable = false, unique = true, length = 15)
    @NotBlank(message = "Phone number is required")
    @Pattern(regexp = "^[0-9]{10,15}$", message = "Phone number must be 10-15 digits")
    private String phoneNumber;

    // Fixed: Use @JdbcTypeCode for proper PostgreSQL BYTEA handling
    @Column(name = "profile_image")
    @JdbcTypeCode(SqlTypes.VARBINARY)
    private byte[] profileImage;

    @Column(length = 50)
    private String imageType;

    @Column
    private Long imageSize;

    @Column
    private LocalDateTime imageUploadedAt;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @Column(nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @Version
    @Column(nullable = false)
    @Builder.Default
    private Long version = 0L;

    @PrePersist
    protected void onCreate() {
        if (isActive == null) {
            isActive = true;
        }
        if (version == null) {
            version = 0L;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        // Additional business logic before update if needed
    }
}