package com.smart_inventory.management.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "stock_transactions")
//Every stock movement is recorded.
//PURCHASE +20 laptops
//SALE -2 laptops
//DAMAGE -1 laptop
//TRANSFER_OUT -5 laptops
@Data
@NoArgsConstructor
@AllArgsConstructor
public class StockTransaction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id",nullable = false)
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "warehouse_id",nullable = false)
    private Warehouse warehouse;

    private Integer quantity;

    @Enumerated(EnumType.STRING)
    private TransactionType transactionType;

    @Column(name = "transaction_date")
    private LocalDateTime transactionDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "performed_by",nullable = false)
    private User performedBy;
}
