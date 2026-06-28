package com.smart_inventory.management.dto;

import com.smart_inventory.management.model.Role;
import jakarta.annotation.Nonnull;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.UniqueConstraint;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserRequestDto {
    @NotBlank(message = "Enter name")
    private String name;
    @NotBlank(message = "Enter Email")
    @Email
    private String email;
    @NotBlank(message = "Enter password")
    private String password;
    @NotNull(message = "Enter Role")
    private Role role;
}
