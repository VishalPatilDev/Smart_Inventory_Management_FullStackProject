package com.smart_inventory.management.dto;


import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class WarehouseResponseDto {
    private Long id;
    private String warehouseName;
    private String address;
}

