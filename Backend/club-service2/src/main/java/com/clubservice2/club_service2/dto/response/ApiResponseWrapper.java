package com.clubservice2.club_service2.dto.response;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class ApiResponseWrapper<T> implements Serializable {
    private Boolean success;
    private String message;
    private T data;
    private LocalDateTime timestamp;
    private String errorCode;
    private List<String> errors;
}