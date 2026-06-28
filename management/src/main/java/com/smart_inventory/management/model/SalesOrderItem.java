package com.smart_inventory.management.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "sales_order_items")
//SO-201
//Laptop 2
//Mouse 3
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SalesOrderItem {

    @Id
    @GeneratedValue
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sales_order_id",nullable = false)
    private SalesOrder salesOrder;

    @ManyToOne(fetch = FetchType.LAZY)
    private Product product;

    private Integer quantity;

    @Column(name = "selling_price")
    private Double sellingPrice;
}
