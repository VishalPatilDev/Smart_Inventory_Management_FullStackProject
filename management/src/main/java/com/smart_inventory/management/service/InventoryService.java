package com.smart_inventory.management.service;


import com.smart_inventory.management.custom_exceptions.ResourceNotFoundException;
import com.smart_inventory.management.dto.InventoryResponseDto;
import com.smart_inventory.management.model.Inventory;
import com.smart_inventory.management.repository.InventoryRepository;
import com.smart_inventory.management.repository.ProductRepository;
import com.smart_inventory.management.repository.WarehouseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class InventoryService {

    @Autowired
    private InventoryRepository inventoryRepository;
    @Autowired
    private ProductRepository productRepository;
    @Autowired
    private WarehouseRepository warehouseRepository;

    private InventoryResponseDto toDto(Inventory inventory) {
        return InventoryResponseDto.builder()
                .id(inventory.getId())
                .productName(inventory.getProduct().getProductName())
                .sku(inventory.getProduct().getSku())
                .warehouseName(inventory.getWarehouse().getWarehouseName())
                .quantity(inventory.getQuantity())
                .reorderThreshold(inventory.getReorderThreshold())
                // Computed flag — no extra DB call needed
                .lowStock(inventory.getQuantity() <= inventory.getReorderThreshold())
                .build();
    }

    // View all stock across every warehouse
    public List<InventoryResponseDto> getAllInventory() {
        return inventoryRepository.findAll()
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    // "Where is this product and how many?" — useful for transfer decisions
    public List<InventoryResponseDto> getInventoryByProduct(Long productId) {
        if (!productRepository.existsById(productId)) {
            throw new ResourceNotFoundException("Product", productId);
        }
        return inventoryRepository.findByProductId(productId)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    // "What stock does Mumbai warehouse hold?"
    public List<InventoryResponseDto> getInventoryByWarehouse(Long warehouseId) {
        if (!warehouseRepository.existsById(warehouseId)) {
            throw new ResourceNotFoundException("Warehouse", warehouseId);
        }
        return inventoryRepository.findByWarehouseId(warehouseId)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    // Low-stock alert — all items at or below their reorder threshold
    public List<InventoryResponseDto> getLowStockItems() {
        return inventoryRepository.findLowStockItems()
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }
}
