package com.smart_inventory.management.controller;


import com.smart_inventory.management.dto.SupplierRequestDto;
import com.smart_inventory.management.service.SupplierService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/inventory_supplier")
public class SupplierController {

    @Autowired
    private SupplierService supplierService;

    @GetMapping
    public ResponseEntity<?> getAllSuppliers() {
        return ResponseEntity.ok(supplierService.getAllSuppliers());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getSupplierById(@PathVariable Long id) {
        return ResponseEntity.ok(supplierService.getSupplierById(id));
    }

    @PreAuthorize("hasAuthority('WRITE')")
    @PostMapping
    public ResponseEntity<?> createSupplier(@Valid @RequestBody SupplierRequestDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(supplierService.createSupplier(dto));
    }

    @PreAuthorize("hasAuthority('WRITE')")
    @PutMapping("/{id}")
    public ResponseEntity<?> updateSupplier(@PathVariable Long id,
                                            @Valid @RequestBody SupplierRequestDto dto) {
        return ResponseEntity.ok(supplierService.updateSupplier(id, dto));
    }

    @PreAuthorize("hasAuthority('DELETE')")
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteSupplier(@PathVariable Long id) {
        supplierService.deleteSupplier(id);
        return ResponseEntity.ok("Supplier deleted successfully");
    }
}
