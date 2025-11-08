package com.profile.profile_management_service.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "user_profiles")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserProfile {

    @Id
    @Column(unique = true, nullable = false)
    private Long prn;

    private Long userId;  // user-service id will be a foreign key
    private String fullName;

    @Column(unique = true, nullable = false)
    private String department;

    private String year;

    private String imagePath;  // path like "/uploads/1_profile.jpg"

}
