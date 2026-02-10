package com.management.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateTenantRequest {

    @NotBlank(message = "Họ tên là bắt buộc")
    @Size(max = 255)
    private String fullName;

    @Size(max = 50)
    private String phone;

    @Size(max = 50)
    private String idNumber;

    @Size(max = 50)
    private String idType;

    @Size(max = 500)
    private String address;
}
