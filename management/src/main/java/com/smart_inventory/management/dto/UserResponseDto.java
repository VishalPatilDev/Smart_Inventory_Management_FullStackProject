package com.smart_inventory.management.dto;

import com.smart_inventory.management.model.Role;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@Builder
@ToString
public class UserResponseDto {
    private Long id;

    private String name;
    private String email;


    private Role role;
}
