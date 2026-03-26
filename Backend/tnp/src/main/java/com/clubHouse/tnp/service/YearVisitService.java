package com.clubHouse.tnp.service;

import com.clubHouse.tnp.dto.response.VisitYearResponse;
import com.clubHouse.tnp.exception.ServiceException;
import com.clubHouse.tnp.mapper.VisitYearMapper;
import com.clubHouse.tnp.model.VisitYear;
import com.clubHouse.tnp.repository.VisitYearRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Slf4j
@Service
public class YearVisitService {

    private final VisitYearRepository visitYearRepository;


    public VisitYearResponse addYear(Integer year) {

        log.info("Attempting to add academic session");
        String academicSession = VisitYear.generateAcademicSession(year);
        VisitYear exists = visitYearRepository.findByAcademicSession(academicSession)
                .orElseThrow(() -> new ServiceException("Not found"));

        if(exists != null){
            log.info("Academic session already exists");
            return VisitYearMapper.toResponse(exists);
        }

        VisitYear vy = VisitYear.builder()
                .academicSession(academicSession)
                .build();

        try{
            VisitYear saved = visitYearRepository.save(vy);
            return VisitYearMapper.toResponse(saved);
        }catch(Exception e){
            throw new ServiceException("Error saving in db.");
        }
    }


    public void delete(Long yearId){
        log.info("Attempting to delete academic session with id: {}", yearId);
        try{
            visitYearRepository.deleteById(yearId);
            log.info("Successfully deleted");
        }catch(Exception e){
            throw new ServiceException("Failed to delete academic session.");
        }
    }

}
