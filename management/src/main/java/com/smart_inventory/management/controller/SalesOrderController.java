package com.smart_inventory.management.controller;

import com.smart_inventory.management.dto.SalesOrderRequestDto;
import com.smart_inventory.management.service.SalesOrderService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/inventory_sales")
public class SalesOrderController {

    @Autowired
    private SalesOrderService salesOrderService;

    @GetMapping
    public ResponseEntity<?> getAllSalesOrders() {
        return ResponseEntity.ok(salesOrderService.getAllSalesOrders());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getSalesOrderById(@PathVariable Long id) {
        return ResponseEntity.ok(salesOrderService.getSalesOrderById(id));
    }

    // Flow: POST body → validate all stock → deduct inventory → log transactions → save order
    // If ANY item lacks stock the WHOLE order is rejected. Nothing is deducted.
    @PreAuthorize("hasAuthority('WRITE')")
    @PostMapping
    public ResponseEntity<?> createSalesOrder(@Valid @RequestBody SalesOrderRequestDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(salesOrderService.createSalesOrder(dto));
    }
}
