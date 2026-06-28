package com.smart_inventory.management.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ProductResponseDto {
    private Long id;
    private String productName;
    private String sku;
    private Double purchasePrice;
    private Double sellingPrice;

    // Flattened — no nested entity, just the names the client needs
    private String categoryName;
    private String supplierName;
}

