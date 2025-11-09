package com.profile.profile_management_service.controller;

import com.profile.profile_management_service.dto.ProfileDto;
import com.profile.profile_management_service.service.ProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/profiles")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService service;

    @PostMapping
    public ResponseEntity<ProfileDto> createProfile(@Valid @RequestBody ProfileDto dto) {
        ProfileDto created = service.createProfile(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{prn}")
    public ResponseEntity<ProfileDto> updateProfile(
            @PathVariable Long prn, @Valid @RequestBody ProfileDto dto) {
        return ResponseEntity.ok(service.updateProfile(prn, dto));
    }

    @GetMapping("/{prn}")
    public ResponseEntity<ProfileDto> getProfile(@PathVariable Long prn) {
        return ResponseEntity.ok(service.getProfileByPrn(prn));
    }

    @GetMapping
    public ResponseEntity<List<ProfileDto>> getAllProfiles() {
        return ResponseEntity.ok(service.getAllProfiles());
    }

    @DeleteMapping("/{prn}")
    public ResponseEntity<String> deleteProfile(@PathVariable Long prn) {
        service.deleteProfile(prn);
        return ResponseEntity.ok("Profile deleted successfully with PRN: " + prn);
    }

    @PostMapping("/{prn}/upload-image")
    public ResponseEntity<String> uploadProfileImage(
            @PathVariable Long prn,
            @RequestParam("file") MultipartFile file) {
        String imagePath = service.uploadProfileImage(prn, file);
        return ResponseEntity.ok("Image uploaded successfully. Path: " + imagePath);
    }
}
