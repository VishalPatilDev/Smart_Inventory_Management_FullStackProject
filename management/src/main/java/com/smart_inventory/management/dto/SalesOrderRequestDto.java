package com.smart_inventory.management.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class SalesOrderRequestDto {

    // Which warehouse are we selling/dispatching from?
    @NotNull(message = "Warehouse ID is required")
    private Long warehouseId;

    @NotEmpty(message = "At least one item is required")
    @Valid
    private List<SalesOrderItemRequestDto> items;
}
