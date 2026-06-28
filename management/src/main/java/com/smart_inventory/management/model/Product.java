package com.smart_inventory.management.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Entity
@Table(name = "products")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "product_name",nullable = false)
    private String productName;

    //Unique id for each product so that we can find product whereever it is in any warehouse
    @Column(unique = true,nullable = false)
    private String sku;

    @Column(name = "purchase_price",nullable = false)
    private double purchasePrice;
    @Column(name = "selling_price",nullable = false)
    private double sellingPrice;


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id",nullable = false)
    private Category category;
    //Why no Cascade?
    //Imagine
    //Electronics
    // ├─ Laptop
    // ├─ Mouse
    // ├─ Keyboard
    //Deleting a category should NOT automatically delete products.

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "supplier_id",nullable = false)
    private Supplier supplier;

    @OneToMany(mappedBy = "product",cascade = CascadeType.ALL,orphanRemoval = true)
    //Inventory row cannot exist without Product.
    private List<Inventory> inventories;

    @OneToMany(mappedBy = "product")
    private List<StockTransaction> stockTransactions;
}
