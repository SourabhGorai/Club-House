package com.clubHouse.tnp.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FilterPrnsResponse implements Serializable {
    private List<String> filteredPrns;
    private Integer count;
}
