package com.smart_inventory.management.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class StockTransferRequestDto {

    @NotNull(message = "Product ID is required")
    private Long productId;

    @NotNull(message = "Source warehouse ID is required")
    private Long fromWarehouseId;

    @NotNull(message = "Destination warehouse ID is required")
    private Long toWarehouseId;

    @NotNull(message = "Quantity is required")
    @Positive(message = "Quantity must be positive")
    private Integer quantity;
}
