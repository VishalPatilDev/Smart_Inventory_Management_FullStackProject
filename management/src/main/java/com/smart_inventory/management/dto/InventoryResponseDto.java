package com.smart_inventory.management.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class InventoryResponseDto {
    private Long id;
    private String productName;
    private String sku;
    private String warehouseName;
    private Integer quantity;
    private Integer reorderThreshold;

    // Convenience flag — true when stock is at or below reorder threshold
    private boolean lowStock;
}
