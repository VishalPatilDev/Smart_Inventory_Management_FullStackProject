package com.smart_inventory.management.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class AuthenticateUserDto {
    @NotBlank(message = "Enter email")
    private String email;
    @NotBlank(message = "Enter password")
    private String password;
}
