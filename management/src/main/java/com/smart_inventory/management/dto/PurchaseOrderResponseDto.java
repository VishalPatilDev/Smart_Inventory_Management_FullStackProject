package com.smart_inventory.management.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.util.List;

@Getter
@Builder
public class PurchaseOrderResponseDto {
    private Long id;
    private LocalDate orderDate;
    private String supplierName;
    private String warehouseName;
    private String createdBy;          // user's name
    private List<PurchaseOrderItemResponseDto> items;
    private Double grandTotal;         // sum of all item totals
}
