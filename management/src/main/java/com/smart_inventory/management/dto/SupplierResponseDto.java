package com.smart_inventory.management.dto;


import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class SupplierResponseDto {
    private Long id;
    private String supplierName;
    private String email;
    private String phone;
}

