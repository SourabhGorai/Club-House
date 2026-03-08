package com.profile.profile_management_service.dto.response;
import com.profile.profile_management_service.dto.ValidationError;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ValidationResponse implements Serializable {

    private Boolean valid;
    private List<ValidationError> errors;
}
