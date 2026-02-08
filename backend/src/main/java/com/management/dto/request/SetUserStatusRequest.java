package com.management.dto.request;

import com.management.domain.enums.UserStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SetUserStatusRequest {

    @NotNull
    private UserStatus status;
}
