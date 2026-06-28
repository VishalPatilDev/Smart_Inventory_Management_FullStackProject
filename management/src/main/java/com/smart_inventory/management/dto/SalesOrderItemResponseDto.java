package com.smart_inventory.management.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class SalesOrderItemResponseDto {
    private Long id;
    private String productName;
    private String sku;
    private Integer quantity;
    private Double sellingPrice;
    private Double totalPrice;   // quantity * sellingPrice
}
