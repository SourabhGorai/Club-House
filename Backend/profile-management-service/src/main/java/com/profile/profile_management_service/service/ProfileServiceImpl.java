package com.profile.profile_management_service.service;

import com.profile.profile_management_service.dto.ProfileDto;
import com.profile.profile_management_service.exception.ResourceNotFoundException;
import com.profile.profile_management_service.model.UserProfile;
import com.profile.profile_management_service.repository.ProfileRepository;
import com.profile.profile_management_service.service.ProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProfileServiceImpl implements ProfileService {

    private final ProfileRepository repository;

    @Override
    public ProfileDto createProfile(ProfileDto dto) {
        UserProfile profile = UserProfile.builder()
                .prn(dto.getPrn())
                .fullName(dto.getFullName())
                .department(dto.getDepartment())
                .year(dto.getYear())
                .imagePath(dto.getImagePath())
                .build();
        repository.save(profile);
        return dto;
    }

    @Override
    public ProfileDto updateProfile(Long prn, ProfileDto dto) {
        UserProfile profile = repository.findById(prn)
                .orElseThrow(() -> new ResourceNotFoundException("Profile not found with PRN: " + prn));

        profile.setFullName(dto.getFullName());
        profile.setDepartment(dto.getDepartment());
        profile.setYear(dto.getYear());
        profile.setImagePath(dto.getImagePath());

        repository.save(profile);
        return dto;
    }

    @Override
    public ProfileDto getProfileByPrn(Long prn) {
        UserProfile profile = repository.findById(prn)
                .orElseThrow(() -> new ResourceNotFoundException("Profile not found with PRN: " + prn));

        return mapToDto(profile);
    }

    @Override
    public List<ProfileDto> getAllProfiles() {
        return repository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public void deleteProfile(Long prn) {
        UserProfile profile = repository.findById(prn)
                .orElseThrow(() -> new ResourceNotFoundException("Profile not found with PRN: " + prn));
        repository.delete(profile);
    }

    private ProfileDto mapToDto(UserProfile profile) {
        return ProfileDto.builder()
                .prn(profile.getPrn())
                .fullName(profile.getFullName())
                .department(profile.getDepartment())
                .year(profile.getYear())
                .imagePath(profile.getImagePath())
                .build();
    }
}
