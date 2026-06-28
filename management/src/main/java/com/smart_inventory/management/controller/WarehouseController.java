package com.smart_inventory.management.controller;


import com.smart_inventory.management.dto.WarehouseRequestDto;
import com.smart_inventory.management.service.WarehouseService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/inventory_warehouse")
public class WarehouseController {

    @Autowired
    private WarehouseService warehouseService;

    @GetMapping
    public ResponseEntity<?> getAllWarehouses() {
        return ResponseEntity.ok(warehouseService.getAllWarehouses());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getWarehouseById(@PathVariable Long id) {
        return ResponseEntity.ok(warehouseService.getWarehouseById(id));
    }

    @PreAuthorize("hasAuthority('WRITE')")
    @PostMapping
    public ResponseEntity<?> createWarehouse(@Valid @RequestBody WarehouseRequestDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(warehouseService.createWarehouse(dto));
    }

    @PreAuthorize("hasAuthority('WRITE')")
    @PutMapping("/{id}")
    public ResponseEntity<?> updateWarehouse(@PathVariable Long id,
                                             @Valid @RequestBody WarehouseRequestDto dto) {
        return ResponseEntity.ok(warehouseService.updateWarehouse(id, dto));
    }

    @PreAuthorize("hasAuthority('DELETE')")
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteWarehouse(@PathVariable Long id) {
        warehouseService.deleteWarehouse(id);
        return ResponseEntity.ok("Warehouse deleted successfully");
    }
}
