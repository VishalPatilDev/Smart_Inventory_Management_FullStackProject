package com.smart_inventory.management.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PurchaseOrderItemRequestDto {

    @NotNull(message = "Product ID is required")
    private Long productId;

    @NotNull(message = "Quantity is required")
    @Positive(message = "Quantity must be positive")
    private Integer quantity;

    // Price at which we are purchasing from supplier (may differ from product's purchasePrice)
    @NotNull(message = "Price is required")
    @Positive(message = "Price must be positive")
    private Double price;
}
