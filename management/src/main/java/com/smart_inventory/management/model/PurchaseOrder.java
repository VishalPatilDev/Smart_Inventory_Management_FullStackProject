package com.smart_inventory.management.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "purchase_order")
//PO-101
//
//Supplier:
//Dell Distributor
//
//Created By:
//Admin
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PurchaseOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "order_date")
    private LocalDate orderDate;

    @ManyToOne(fetch = FetchType.LAZY)
    private Supplier supplier;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by",nullable = false)
    private User createdBy;

    @OneToMany(mappedBy = "purchaseOrder",cascade = CascadeType.ALL,orphanRemoval = true)
    private List<PurchaseOrderItem> purchaseOrderItems;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "warehouse_id", nullable = false)
    private Warehouse warehouse;
}
