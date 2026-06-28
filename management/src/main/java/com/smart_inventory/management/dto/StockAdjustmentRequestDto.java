package com.smart_inventory.management.dto;

import com.smart_inventory.management.model.TransactionType;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class StockAdjustmentRequestDto {

    @NotNull(message = "Product ID is required")
    private Long productId;

    @NotNull(message = "Warehouse ID is required")
    private Long warehouseId;

    @NotNull(message = "Quantity is required")
    @Positive(message = "Quantity must be positive")
    private Integer quantity;

    // Only DAMAGE, RETURN, ADJUSTMENT allowed here — not PURCHASE/SALE (those go via orders)
    @NotNull(message = "Transaction type is required")
    private TransactionType transactionType;
}
