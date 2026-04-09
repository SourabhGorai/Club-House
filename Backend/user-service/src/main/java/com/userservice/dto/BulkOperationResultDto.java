package com.userservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BulkOperationResultDto {

    private int total;
    private int success;
    private int failed;
    private List<Map<String, Object>> results;
}