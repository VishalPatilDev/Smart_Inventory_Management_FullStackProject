package com.smart_inventory.management.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class PurchaseOrderItemResponseDto {
    private Long id;
    private String productName;
    private String sku;
    private Integer quantity;
    private Double price;
    private Double totalPrice;   // quantity * price — computed, not stored
}
