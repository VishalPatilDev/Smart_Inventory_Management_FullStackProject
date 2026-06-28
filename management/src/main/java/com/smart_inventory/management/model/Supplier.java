package com.smart_inventory.management.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Entity
@Table(name = "suppliers")
//A company from whom we buy products.
//Dell Distributor
//Samsung Distributor
//HP Distributor
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Supplier {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "supplier_name",nullable = false)
    private String supplierName;

//    @Column(nullable = false)
    private String email;

    private String phone;

    @OneToMany(mappedBy = "supplier")
    private List<Product> products;


}
