package com.smart_inventory.management.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProductRequestDto {

    @NotBlank(message = "Product name is required")
    private String productName;

    @NotBlank(message = "SKU is required")
    private String sku;

    @NotNull(message = "Purchase price is required")
    @Positive(message = "Purchase price must be positive")
    private Double purchasePrice;

    @NotNull(message = "Selling price is required")
    @Positive(message = "Selling price must be positive")
    private Double sellingPrice;

    @NotNull(message = "Category ID is required")
    private Long categoryId;

    @NotNull(message = "Supplier ID is required")
    private Long supplierId;
}