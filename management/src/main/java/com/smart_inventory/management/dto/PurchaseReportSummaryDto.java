package com.smart_inventory.management.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.util.List;

@Getter
@Builder
public class PurchaseReportSummaryDto {
    private LocalDate from;
    private LocalDate to;
    private List<PurchaseReportItemDto> items;
    private Double totalAmountSpent;
    private Integer totalOrdersPlaced;
    private Integer totalUnitsPurchased;
}