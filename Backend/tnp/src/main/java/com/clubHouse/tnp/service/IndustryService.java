package com.clubHouse.tnp.service;

import com.clubHouse.tnp.dto.response.IndustryResponse;
import com.clubHouse.tnp.exception.ServiceException;
import com.clubHouse.tnp.exception.UnauthorizedException;
import com.clubHouse.tnp.mapper.CompanyMapper;
import com.clubHouse.tnp.mapper.IndustryMapper;
import com.clubHouse.tnp.model.Industry;
import com.clubHouse.tnp.model.Tnp;
import com.clubHouse.tnp.model.TnpRoles;
import com.clubHouse.tnp.repository.IndustryRepository;
import com.clubHouse.tnp.repository.TnpRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.Objects;

@Service
@Slf4j
@RequiredArgsConstructor
public class IndustryService {

    private final IndustryRepository industryRepository;
    private final TnpRepository tnpRepository;

    // ---------------------------------------------------------------------------

    public boolean authorize(String prn) {

        log.info("Checking authorization for prn: {}", prn);

        Tnp user = tnpRepository.findByPrn(prn);
        if (user == null) return false;

        return user.getRole() == TnpRoles.TNP_HEAD ||
                user.getRole() == TnpRoles.PRESIDENT ||
                user.getRole() == TnpRoles.VICE_PRESIDENT;
    }

    // ---------------------------------------------------------------------------

    public IndustryResponse add(String name) {

        log.info("Attempting to add new Industry");
        Optional<Industry> exists = industryRepository.findByName(name);

        if(exists.isPresent()){
            log.info("Industry already exists in the list");
            return IndustryMapper.toResponse(exists.get());
        }

        try{
            Industry saved = industryRepository.save(
                    Industry.builder()
                            .name(IndustryMapper.sanitizeIndustry(name))
                            .build()
            );
            return IndustryMapper.toResponse(saved);
        } catch (Exception e) {
            throw new ServiceException("Error saving in db");
        }
    }


    public List<IndustryResponse> addBulk(List<String> industryNames) {

        log.info("Attempting to add industries in bulk");

        if (industryNames == null || industryNames.isEmpty()) {
            return List.of();
        }

        // 1. Sanitize + remove duplicates (in request)
        List<String> sanitizedNames = industryNames.stream()
                .filter(Objects::nonNull)
                .map(CompanyMapper::sanitizeIndustry)
                .distinct()
                .toList();

        // 2. Fetch already existing industries from DB
        List<Industry> existingIndustries = industryRepository.findAll();

        Set<String> existingNames = existingIndustries.stream()
                .map(Industry::getName)
                .collect(Collectors.toSet());

        // 3. Create only new industries
        List<Industry> newIndustries = sanitizedNames.stream()
                .filter(name -> !existingNames.contains(name))
                .map(name -> Industry.builder()
                        .name(name)
                        .build())
                .toList();

        if (newIndustries.isEmpty()) {
            log.info("No new industries to add");
            return List.of();
        }

        // 4. Save
        List<Industry> saved = industryRepository.saveAll(newIndustries);

        log.info("Saved {} new industries", saved.size());

        // 5. Convert to response
        return saved.stream()
                .map(industry -> IndustryResponse.builder()
                        .industryId(industry.getIndustryId())
                        .name(industry.getName())
                        .build())
                .toList();
    }


    public IndustryResponse update(Long industryId, String name) {

        log.info("Attempting to update industry with id: {}", industryId);
        Industry industry = industryRepository.findById(industryId).orElseThrow();
        industry.setName(IndustryMapper.sanitizeIndustry(name));
        try{
            Industry saved = industryRepository.save(industry);
            return IndustryMapper.toResponse(saved);
        }catch(Exception e){
            throw new ServiceException("Failed to save in db");
        }
    }

    public String delete(String prn, String role, Long id) {

        Industry industry = industryRepository.findById(id).orElseThrow();
        String name = industry.getName();

        log.info("Attempting to delete industry: {}", name);

        if(!role.equals("SUPER_ADMIN") && !authorize(prn)){
            throw new UnauthorizedException("Not Authorized to delete Industry");
        }

        try{
            industryRepository.delete(industry);
            return name;
        }catch (Exception e){
            throw new ServiceException(String.format("Failed to delete industry: %s", name));
        }

    }


    public List<IndustryResponse> getAll() {

        log.info("Attempting to fetch all the Industries");
        List<Industry> industries = industryRepository.findAll();
        return IndustryMapper.toResponseList(industries);

    }

    public IndustryResponse getById(Long id) {

        log.info("Attempting to fetch industry with Id: {}", id);
        Industry industry = industryRepository.findById(id).orElseThrow();
        return IndustryMapper.toResponse(industry);

    }
}
