package com.smart_inventory.management.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Entity
@Table(name = "warehouses")
//Mumbai Warehouse
//Pune Warehouse
//Delhi Warehouse
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Warehouse {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "warehouse_name",unique = true,nullable = false)
    private String warehouseName;

    private String address;

    @OneToMany(mappedBy = "warehouse",cascade = CascadeType.ALL,orphanRemoval = true)
    //Inventory record cannot exist without warehouse.
    private List<Inventory> inventories;

    @OneToMany(mappedBy = "warehouse")
    private List<StockTransaction> stockTransactions;
}
