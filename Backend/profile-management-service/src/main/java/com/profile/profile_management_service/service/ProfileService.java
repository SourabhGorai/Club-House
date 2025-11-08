package com.profile.profile_management_service.service;

import com.profile.profile_management_service.dto.ProfileDto;
import java.util.List;

public interface ProfileService {
    ProfileDto createProfile(ProfileDto dto);
    ProfileDto updateProfile(Long prn, ProfileDto dto);
    ProfileDto getProfileByPrn(Long prn);
    List<ProfileDto> getAllProfiles();
    void deleteProfile(Long prn);
}
