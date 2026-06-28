package com.smart_inventory.management.repository;

import com.smart_inventory.management.model.Supplier;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SupplierRepository extends JpaRepository<Supplier, Long> {
    boolean existsBySupplierName(String supplierName);
}
