package com.profile.profile_management_service.service;

import com.profile.profile_management_service.dto.ProfileDto;
import com.profile.profile_management_service.exception.ResourceNotFoundException;
import com.profile.profile_management_service.model.UserProfile;
import com.profile.profile_management_service.repository.ProfileRepository;
import com.profile.profile_management_service.service.ProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProfileServiceImpl implements ProfileService {

    private final ProfileRepository repository;

    private static final String UPLOAD_DIR = "uploads/";

    @Override
    public ProfileDto createProfile(ProfileDto dto) {
        UserProfile profile = mapToEntity(dto);
        repository.save(profile);
        return mapToDto(profile);
    }

    @Override
    public ProfileDto updateProfile(Long prn, ProfileDto dto) {
        UserProfile profile = repository.findById(prn)
                .orElseThrow(() -> new ResourceNotFoundException("Profile not found with PRN: " + prn));

        profile.setFullName(dto.getFullName());
        profile.setDepartment(dto.getDepartment());
        profile.setYear(dto.getYear());
        profile.setImagePath(dto.getImagePath());
        profile.setUserId(dto.getUserId());

        repository.save(profile);
        return mapToDto(profile);
    }

    @Override
    public ProfileDto getProfileByPrn(Long prn) {
        UserProfile profile = repository.findById(prn)
                .orElseThrow(() -> new ResourceNotFoundException("Profile not found with PRN: " + prn));
        return mapToDto(profile);
    }

    @Override
    public List<ProfileDto> getAllProfiles() {
        return repository.findAll()
                .stream()
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
                .userId(profile.getUserId())
                .fullName(profile.getFullName())
                .department(profile.getDepartment())
                .year(profile.getYear())
                .imagePath(profile.getImagePath())
                .build();
    }

    private UserProfile mapToEntity(ProfileDto dto) {
        return UserProfile.builder()
                .prn(dto.getPrn())
                .userId(dto.getUserId())
                .fullName(dto.getFullName())
                .department(dto.getDepartment())
                .year(dto.getYear())
                .imagePath(dto.getImagePath())
                .build();
    }

    public String uploadProfileImage(Long prn, MultipartFile file) {
        UserProfile profile = repository.findById(prn)
                .orElseThrow(() -> new ResourceNotFoundException("Profile not found with PRN: " + prn));

        // Validate file
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File cannot be empty.");
        }
        if (file.getSize() > 500 * 1024) { // 500 KB limit
            throw new IllegalArgumentException("File size exceeds 500KB limit.");
        }
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("Only image files are allowed.");
        }

        try {
            // Ensure uploads folder exists
            Path uploadPath = Paths.get(UPLOAD_DIR);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // Create unique file name
            String fileName = prn + "_" + System.currentTimeMillis() + "_" + file.getOriginalFilename();
            Path filePath = uploadPath.resolve(fileName);

            // Save the file
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            // Update image path in DB
            String storedPath = "/uploads/" + fileName;
            profile.setImagePath(storedPath);
            repository.save(profile);

            return storedPath;
        } catch (IOException e) {
            throw new RuntimeException("Error saving file: " + e.getMessage());
        }
    }
}
