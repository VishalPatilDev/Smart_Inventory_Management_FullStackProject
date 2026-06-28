package com.smart_inventory.management.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class TopProductDto {
    private String productName;
    private String sku;
    private String categoryName;
    private Integer totalQuantity;    // units sold or purchased depending on context
    private Double totalValue;        // revenue (sales) or spend (purchases)
}
