package com.clubHouse.tnp.service;

import com.clubHouse.tnp.dto.response.VisitYearResponse;
import com.clubHouse.tnp.exception.ServiceException;
import com.clubHouse.tnp.exception.UnauthorizedException;
import com.clubHouse.tnp.mapper.VisitYearMapper;
import com.clubHouse.tnp.model.Tnp;
import com.clubHouse.tnp.model.TnpRoles;
import com.clubHouse.tnp.model.VisitYear;
import com.clubHouse.tnp.repository.TnpRepository;
import com.clubHouse.tnp.repository.VisitYearRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@RequiredArgsConstructor
@Slf4j
@Service
public class YearVisitService {

    private final VisitYearRepository visitYearRepository;
    private final TnpRepository tnpRepository;


    public VisitYearResponse addYear(Integer year) {

        log.info("Attempting to add academic session");
        String academicSession = VisitYear.generateAcademicSession(year);
        Optional<VisitYear> exists = visitYearRepository.findByAcademicSession(academicSession);

        if(exists.isPresent()){
            log.info("Academic session already exists");
            return VisitYearMapper.toResponse(exists.get());
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


    public List<VisitYearResponse> getAll() {

        log.info("Attempting to fetch all sessions");
        List<VisitYear> visits = visitYearRepository.findAll();
        return VisitYearMapper.toResponseList(visits);

    }


    public void delete(Long yearId, String prn, String role){
        log.info("Attempting to delete academic session with id: {}", yearId);
        if(!role.equals("SUPER_ADMIN") && !authorize(prn)){
            throw new UnauthorizedException("Not Authorized to delete Industry");
        }
        try{
            visitYearRepository.deleteById(yearId);
            log.info("Successfully deleted");
        }catch(Exception e){
            throw new ServiceException("Failed to delete academic session.");
        }
    }

    // ---------------------------------------------------------------------------

    public boolean authorize(String prn) {

        log.info("Checking authorization for prn: {}", prn);

        Tnp user = tnpRepository.findByPrnAndIsActiveTrue(prn);
        if (user == null) return false;

        return user.getRole() == TnpRoles.TNP_HEAD ||
                user.getRole() == TnpRoles.PRESIDENT ||
                user.getRole() == TnpRoles.VICE_PRESIDENT;
    }
}
