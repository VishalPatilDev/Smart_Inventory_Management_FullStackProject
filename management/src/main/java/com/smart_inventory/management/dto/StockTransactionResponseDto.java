package com.smart_inventory.management.dto;

import com.smart_inventory.management.model.TransactionType;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class StockTransactionResponseDto {
    private Long id;
    private String productName;
    private String sku;
    private String warehouseName;
    private Integer quantity;
    private TransactionType transactionType;
    private LocalDateTime transactionDate;
    private String performedBy;   // user's name
}
