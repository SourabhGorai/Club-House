package com.user_service.user_service.service;

import com.user_service.user_service.dto.UserCreateDto;
import com.user_service.user_service.dto.UserDto;
import com.user_service.user_service.dto.UserUpdateDto;
import com.user_service.user_service.model.User;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {

    public UserDto toDto(User u) {
        if (u == null) return null;
        return UserDto.builder()
                .id(u.getId())
                .username(u.getUsername())
                .email(u.getEmail())
                .role(u.getRole())
                .verified(u.isVerified())
                .build();
    }

    public User toEntity(UserCreateDto dto) {
        if (dto == null) return null;
        return User.builder()
                .username(dto.getUsername())
                .password(dto.getPassword())
                .email(dto.getEmail())
                .role(dto.getRole())
                .build();
    }

    public void updateEntityFromDto(UserUpdateDto dto, User user) {
        if (dto == null || user == null) return;
        if (dto.getEmail() != null) user.setEmail(dto.getEmail());
        if (dto.getRole() != null) user.setRole(dto.getRole());
        if (dto.getPassword() != null) user.setPassword(dto.getPassword());
    }
}
