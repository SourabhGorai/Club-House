package com.userservice.service;


import com.userservice.dto.UserCreateDto;
import com.userservice.dto.UserDto;
import com.userservice.dto.UserUpdateDto;

import com.userservice.model.User;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {

    public UserDto toDto(User u) {
        if (u == null) return null;
        return UserDto.builder()
                .prn(u.getPrn())
                .username(u.getUsername())
                .email(u.getEmail())
                .role(u.getRole())
                .verified(u.isVerified())
                .profileCompleted(u.isProfileCompleted())
                .build();
    }

    public User toEntity(UserCreateDto dto) {
        if (dto == null) return null;
        return User.builder()
                .prn(dto.getPrn())
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
