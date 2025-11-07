package com.user_service.user_service.dto;

import com.user_service.user_service.model.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserCreateDto {
    @NotBlank
    private String username;

    @NotBlank
    private String password;

    @Email
    private String email;

    private Role role;
}
