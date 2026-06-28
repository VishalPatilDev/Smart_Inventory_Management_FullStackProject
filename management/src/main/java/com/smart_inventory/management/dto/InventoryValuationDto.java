package com.smart_inventory.management.dto;

import lombok.Builder;
import lombok.Getter;

// Represents one row in the inventory valuation report
// Value = quantity * purchasePrice (what the stock cost us to buy)
// Profit potential = quantity * (sellingPrice - purchasePrice)
@Getter
@Builder
public class InventoryValuationDto {
    private String warehouseName;
    private String productName;
    private String sku;
    private Integer quantity;
    private Double purchasePrice;
    private Double sellingPrice;
    private Double totalCostValue;      // quantity * purchasePrice
    private Double totalSaleValue;      // quantity * sellingPrice
    private Double potentialProfit;     // totalSaleValue - totalCostValue
}
