package com.profile.profile_management_service.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class FilteredPrnResponse implements Serializable {
    private List<String> filteredPrns;
    private Integer count;
}
