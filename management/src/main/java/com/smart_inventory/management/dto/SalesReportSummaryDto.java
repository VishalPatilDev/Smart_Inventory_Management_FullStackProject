package com.smart_inventory.management.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.util.List;

@Getter
@Builder
public class SalesReportSummaryDto {
    private LocalDate from;
    private LocalDate to;
    private List<SalesReportItemDto> items;
    private Double totalRevenue;
    private Double totalCostOfGoods;
    private Double totalGrossProfit;
    private Integer totalOrdersPlaced;
    private Integer totalUnitsSold;
}
