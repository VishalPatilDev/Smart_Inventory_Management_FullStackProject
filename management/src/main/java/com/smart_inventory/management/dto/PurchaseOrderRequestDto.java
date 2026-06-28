package com.smart_inventory.management.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class PurchaseOrderRequestDto {

    @NotNull(message = "Supplier ID is required")
    private Long supplierId;

    // Which warehouse are we receiving stock into?
    @NotNull(message = "Warehouse ID is required")
    private Long warehouseId;

    @NotEmpty(message = "At least one item is required")
    @Valid  // triggers validation on each item inside the list
    private List<PurchaseOrderItemRequestDto> items;
}