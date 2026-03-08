package com.profile.profile_management_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class YearStatistics implements Serializable {

    private java.util.Map<Integer, Long> profilesByYear;
}