package com.smart_inventory.management.repository;


import com.smart_inventory.management.model.Warehouse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface WarehouseRepository extends JpaRepository<Warehouse, Long> {
    boolean existsByWarehouseName(String warehouseName);
}
