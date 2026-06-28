package com.smart_inventory.management.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class LowStockAlertDto {
    private Long productId;
    private String productName;
    private String sku;
    private String supplierName;       // who to reorder from
    private String warehouseName;
    private Integer currentQuantity;
    private Integer reorderThreshold;
    private Integer shortfall;         // how many units below the threshold
    private String urgency;            // "CRITICAL" (qty=0), "LOW" (qty <= threshold)
}
