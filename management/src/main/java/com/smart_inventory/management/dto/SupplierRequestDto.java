package com.smart_inventory.management.dto;


import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SupplierRequestDto {

    @NotBlank(message = "Supplier name is required")
    private String supplierName;

    @Email(message = "Enter a valid email")
    private String email;

    private String phone;
}
