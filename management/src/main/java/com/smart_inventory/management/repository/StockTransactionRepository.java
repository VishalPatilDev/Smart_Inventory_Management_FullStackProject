package com.smart_inventory.management.repository;

import com.smart_inventory.management.model.StockTransaction;
import com.smart_inventory.management.model.TransactionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface StockTransactionRepository extends JpaRepository<StockTransaction, Long> {

    // Audit trail: all movements for a product
    List<StockTransaction> findByProductId(Long productId);

    // All movements in a warehouse
    List<StockTransaction> findByWarehouseId(Long warehouseId);

    // Filter by type — e.g. show me all DAMAGEs
    List<StockTransaction> findByTransactionType(TransactionType type);

    // Date range filter — useful for reports
    List<StockTransaction> findByTransactionDateBetween(LocalDateTime from, LocalDateTime to);

    // What did a specific user do?
    List<StockTransaction> findByPerformedById(Long userId);
}