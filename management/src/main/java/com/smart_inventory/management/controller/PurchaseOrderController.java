package com.smart_inventory.management.controller;

import com.smart_inventory.management.dto.PurchaseOrderRequestDto;
import com.smart_inventory.management.service.PurchaseOrderService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/inventory_purchase")
public class PurchaseOrderController {

    @Autowired
    private PurchaseOrderService purchaseOrderService;

    // View all purchase orders — any authenticated user
    @GetMapping
    public ResponseEntity<?> getAllPurchaseOrders() {
        return ResponseEntity.ok(purchaseOrderService.getAllPurchaseOrders());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getPurchaseOrderById(@PathVariable Long id) {
        return ResponseEntity.ok(purchaseOrderService.getPurchaseOrderById(id));
    }

    // Only WRITE permission can create orders (ADMIN)
    // Flow: POST body → validate → save order + increase inventory + log transaction
    @PreAuthorize("hasAuthority('WRITE')")
    @PostMapping
    public ResponseEntity<?> createPurchaseOrder(@Valid @RequestBody PurchaseOrderRequestDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(purchaseOrderService.createPurchaseOrder(dto));
    }
}
