package com.smart_inventory.management.repository;

import com.smart_inventory.management.model.PurchaseOrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface PurchaseOrderItemRepository extends JpaRepository<PurchaseOrderItem, Long> {

    // All purchase order items within a date range
    @Query("""
            SELECT p FROM PurchaseOrderItem p
            WHERE p.purchaseOrder.orderDate BETWEEN :from AND :to
            ORDER BY p.product.productName
            """)
    List<PurchaseOrderItem> findItemsBetweenDates(
            @Param("from") LocalDate from,
            @Param("to") LocalDate to);

    // Top purchased products (by quantity) — useful for procurement decisions
    @Query("""
            SELECT p.product.id,
                   p.product.productName,
                   p.product.sku,
                   p.product.category.name,
                   SUM(p.quantity),
                   SUM(p.quantity * p.price)
            FROM PurchaseOrderItem p
            WHERE p.purchaseOrder.orderDate BETWEEN :from AND :to
            GROUP BY p.product.id, p.product.productName, p.product.sku, p.product.category.name
            ORDER BY SUM(p.quantity) DESC
            """)
    List<Object[]> findTopPurchasedProducts(
            @Param("from") LocalDate from,
            @Param("to") LocalDate to);

    // Count distinct purchase orders in a date range
    @Query("""
            SELECT COUNT(DISTINCT p.purchaseOrder.id)
            FROM PurchaseOrderItem p
            WHERE p.purchaseOrder.orderDate BETWEEN :from AND :to
            """)
    Long countOrdersBetweenDates(
            @Param("from") LocalDate from,
            @Param("to") LocalDate to);
}