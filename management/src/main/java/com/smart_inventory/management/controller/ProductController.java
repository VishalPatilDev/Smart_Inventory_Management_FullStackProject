package com.smart_inventory.management.controller;

import com.smart_inventory.management.dto.ProductRequestDto;
import com.smart_inventory.management.service.ProductService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("inventory_product")
public class ProductController {

    @Autowired
    private ProductService productService;

    // GET /inventory_product               → all products
    // GET /inventory_product?categoryId=1  → filter by category
    // GET /inventory_product?supplierId=2  → filter by supplier
    @GetMapping
    public ResponseEntity<?> getProducts(
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Long supplierId) {

        if (categoryId != null) {
            return ResponseEntity.ok(productService.getProductsByCategory(categoryId));
        }
        if (supplierId != null) {
            return ResponseEntity.ok(productService.getProductsBySupplier(supplierId));
        }
        return ResponseEntity.ok(productService.getAllProducts());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getProductById(@PathVariable Long id) {
        return ResponseEntity.ok(productService.getProductById(id));
    }

    // Lookup by SKU — handy when scanning a barcode
    @GetMapping("/sku/{sku}")
    public ResponseEntity<?> getProductBySku(@PathVariable String sku) {
        return ResponseEntity.ok(productService.getProductBySku(sku));
    }

    @PreAuthorize("hasAuthority('WRITE')")
    @PostMapping
    public ResponseEntity<?> createProduct(@Valid @RequestBody ProductRequestDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(productService.createProduct(dto));
    }

    @PreAuthorize("hasAuthority('WRITE')")
    @PutMapping("/{id}")
    public ResponseEntity<?> updateProduct(@PathVariable Long id,
                                           @Valid @RequestBody ProductRequestDto dto) {
        return ResponseEntity.ok(productService.updateProduct(id, dto));
    }

    @PreAuthorize("hasAuthority('DELETE')")
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.ok("Product deleted successfully");
    }
}
