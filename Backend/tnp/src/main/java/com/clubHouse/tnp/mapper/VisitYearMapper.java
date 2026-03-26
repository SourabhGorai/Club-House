package com.clubHouse.tnp.mapper;

import com.clubHouse.tnp.dto.response.VisitYearResponse;
import com.clubHouse.tnp.model.VisitYear;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class VisitYearMapper {

    public static VisitYearResponse toResponse(VisitYear visitYear){

        if(visitYear == null) return null;

        return VisitYearResponse.builder()
                .yearId(visitYear.getYearId())
                .academicSession(visitYear.getAcademicSession())
                .build();

    }

    public static List<VisitYearResponse> toResponseList(List<VisitYear> list){

        if(list == null || list.isEmpty()) return List.of();

        return list.stream()
                .map(VisitYearMapper::toResponse)
                .toList();

    }

}
