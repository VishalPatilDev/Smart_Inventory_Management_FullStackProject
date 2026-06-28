package com.smart_inventory.management.controller;

import com.smart_inventory.management.service.InventoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;


@RestController
@RequestMapping("/inventory_stock")
public class InventoryController {

    @Autowired
    private InventoryService inventoryService;

    // All stock across all warehouses
    @GetMapping
    public ResponseEntity<?> getAllInventory() {
        return ResponseEntity.ok(inventoryService.getAllInventory());
    }

    // Stock levels for one product — across every warehouse
    // GET /inventory_stock/product/5
    @GetMapping("/product/{productId}")
    public ResponseEntity<?> getByProduct(@PathVariable Long productId) {
        return ResponseEntity.ok(inventoryService.getInventoryByProduct(productId));
    }

    // All stock inside one warehouse
    // GET /inventory_stock/warehouse/2
    @GetMapping("/warehouse/{warehouseId}")
    public ResponseEntity<?> getByWarehouse(@PathVariable Long warehouseId) {
        return ResponseEntity.ok(inventoryService.getInventoryByWarehouse(warehouseId));
    }

    // Low-stock alert — items at or below their reorder threshold
    // GET /inventory_stock/low-stock
    @GetMapping("/low-stock")
    public ResponseEntity<?> getLowStockItems() {
        return ResponseEntity.ok(inventoryService.getLowStockItems());
    }
}

