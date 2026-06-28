package com.smart_inventory.management.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.util.List;

@Getter
@Builder
public class SalesOrderResponseDto {
    private Long id;
    private LocalDate orderDate;
    private String warehouseName;
    private String createdBy;
    private List<SalesOrderItemResponseDto> items;
    private Double grandTotal;
}
