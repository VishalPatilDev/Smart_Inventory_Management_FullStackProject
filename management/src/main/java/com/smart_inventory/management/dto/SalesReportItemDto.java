package com.smart_inventory.management.dto;

import lombok.Builder;
import lombok.Getter;

// One row in the sales report — per product sold in the period
@Getter
@Builder
public class SalesReportItemDto {
    private String productName;
    private String sku;
    private Integer totalQuantitySold;
    private Double revenueGenerated;    // totalQty * sellingPrice
    private Double costOfGoods;         // totalQty * purchasePrice
    private Double grossProfit;         // revenue - cost
}
