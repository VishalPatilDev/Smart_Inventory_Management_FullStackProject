package com.smart_inventory.management.repository;

import com.smart_inventory.management.model.Inventory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InventoryRepository extends JpaRepository<Inventory, Long> {

    // All inventory rows for a specific product (across all warehouses)
    List<Inventory> findByProductId(Long productId);

    // All inventory rows for a specific warehouse
    List<Inventory> findByWarehouseId(Long warehouseId);

    // Specific product in a specific warehouse — used when updating stock
    Optional<Inventory> findByProductIdAndWarehouseId(Long productId, Long warehouseId);

    // Low-stock alert: all rows where quantity is at or below the reorder threshold
    @Query("SELECT i FROM Inventory i WHERE i.quantity <= i.reorderThreshold")
    List<Inventory> findLowStockItems();
}
