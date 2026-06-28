package com.smart_inventory.management.dto;


import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class WarehouseRequestDto {

    @NotBlank(message = "Warehouse name is required")
    private String warehouseName;

    private String address;
}

