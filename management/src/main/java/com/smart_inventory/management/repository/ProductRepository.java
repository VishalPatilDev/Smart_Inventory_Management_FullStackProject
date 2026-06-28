package com.smart_inventory.management.repository;

import com.smart_inventory.management.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    Optional<Product> findBySku(String sku);
    boolean existsBySku(String sku);

    // Filter by category
    List<Product> findByCategoryId(Long categoryId);

    // Filter by supplier
    List<Product> findBySupplierId(Long supplierId);
}

