package com.smart_inventory.management.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

// Summary for one warehouse — contains all its product lines + rolled-up totals
@Getter
@Builder
public class WarehouseValuationSummaryDto {
    private String warehouseName;
    private List<InventoryValuationDto> items;
    private Double totalCostValue;      // sum of all item costValues in this warehouse
    private Double totalSaleValue;      // sum of all item saleValues
    private Double totalPotentialProfit;
    private Integer totalProducts;      // how many distinct products
    private Integer totalUnits;         // total units across all products
}
