package com.smart_inventory.management.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.util.List;

@Getter
@Builder
public class PurchaseReportItemDto {
    private String productName;
    private String sku;
    private String supplierName;
    private Integer totalQuantityPurchased;
    private Double totalAmountSpent;
}

