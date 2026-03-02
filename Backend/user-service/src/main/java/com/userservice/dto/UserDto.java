package com.userservice.dto;

import com.userservice.model.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserDto {
    private String prn;
    private String username;
    private String email;
    private Role role;
    private boolean verified;
    private boolean profileCompleted;
}
