package com.smart_inventory.management.repository;

import com.smart_inventory.management.model.SalesOrderItem;
import com.smart_inventory.management.model.PurchaseOrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

// This repository exists purely for report queries.
// We anchor it on SalesOrderItem since it has both product + order date access.
@Repository
public interface SalesOrderItemRepository extends JpaRepository<SalesOrderItem, Long> {

    // All sales order items within a date range
    // We join up to the parent SalesOrder to filter by date
    @Query("""
            SELECT s FROM SalesOrderItem s
            WHERE s.salesOrder.orderDate BETWEEN :from AND :to
            ORDER BY s.product.productName
            """)
    List<SalesOrderItem> findItemsBetweenDates(
            @Param("from") LocalDate from,
            @Param("to") LocalDate to);

    // Total quantity sold per product — used for top sellers
    // Returns Object[] rows: [productId, productName, sku, categoryName, totalQty, totalRevenue]
    @Query("""
            SELECT s.product.id,
                   s.product.productName,
                   s.product.sku,
                   s.product.category.name,
                   SUM(s.quantity),
                   SUM(s.quantity * s.sellingPrice)
            FROM SalesOrderItem s
            WHERE s.salesOrder.orderDate BETWEEN :from AND :to
            GROUP BY s.product.id, s.product.productName, s.product.sku, s.product.category.name
            ORDER BY SUM(s.quantity) DESC
            """)
    List<Object[]> findTopSellingProducts(
            @Param("from") LocalDate from,
            @Param("to") LocalDate to);

    // Count distinct sales orders in a date range
    @Query("""
            SELECT COUNT(DISTINCT s.salesOrder.id)
            FROM SalesOrderItem s
            WHERE s.salesOrder.orderDate BETWEEN :from AND :to
            """)
    Long countOrdersBetweenDates(
            @Param("from") LocalDate from,
            @Param("to") LocalDate to);
}
