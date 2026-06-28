package com.smart_inventory.management.repository;

import com.smart_inventory.management.model.PurchaseOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PurchaseOrderRepository extends JpaRepository<PurchaseOrder, Long> {
    List<PurchaseOrder> findBySupplierId(Long supplierId);
    List<PurchaseOrder> findByCreatedById(Long userId);
}
