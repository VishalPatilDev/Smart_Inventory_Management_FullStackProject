package com.smart_inventory.management.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "inventories")
//Example Data
//Product	Warehouse	Quantity
//Laptop	Mumbai	50
//Laptop	Pune	20
//Laptop	Delhi	30
@Data
@NoArgsConstructor
@AllArgsConstructor

public class Inventory {

//    @Version
//    private Long version;
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id",nullable = false)
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "warehouse_id",nullable = false)
    private Warehouse warehouse;

    @Column(nullable = false)
    private Integer quantity;

    @Column(name = "reorder_threshold",nullable = false)
    private Integer reorderThreshold;
}
