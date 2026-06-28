package com.smart_inventory.management.controller;

import com.smart_inventory.management.dto.StockAdjustmentRequestDto;
import com.smart_inventory.management.dto.StockTransferRequestDto;
import com.smart_inventory.management.model.TransactionType;
import com.smart_inventory.management.service.StockTransactionService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/inventory_transactions")
public class StockTransactionController {

    @Autowired
    private StockTransactionService stockTransactionService;

    // ── Audit trail ───────────────────────────────────────────────────────────

    // GET /inventory_transactions                         → all transactions
    // GET /inventory_transactions?productId=3             → filter by product
    // GET /inventory_transactions?warehouseId=1           → filter by warehouse
    // GET /inventory_transactions?type=DAMAGE             → filter by type
    // GET /inventory_transactions?from=...&to=...         → filter by date range
    @GetMapping
    public ResponseEntity<?> getTransactions(
            @RequestParam(required = false) Long productId,
            @RequestParam(required = false) Long warehouseId,
            @RequestParam(required = false) TransactionType type,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to) {

        if (productId != null) return ResponseEntity.ok(stockTransactionService.getTransactionsByProduct(productId));
        if (warehouseId != null) return ResponseEntity.ok(stockTransactionService.getTransactionsByWarehouse(warehouseId));
        if (type != null) return ResponseEntity.ok(stockTransactionService.getTransactionsByType(type));
        if (from != null && to != null) return ResponseEntity.ok(stockTransactionService.getTransactionsByDateRange(from, to));

        return ResponseEntity.ok(stockTransactionService.getAllTransactions());
    }

    // ── Transfer between warehouses ───────────────────────────────────────────
    // POST /inventory_transactions/transfer
    // Body: { productId, fromWarehouseId, toWarehouseId, quantity }
    @PreAuthorize("hasAuthority('WRITE')")
    @PostMapping("/transfer")
    public ResponseEntity<?> transferStock(@Valid @RequestBody StockTransferRequestDto dto) {
        return ResponseEntity.ok(stockTransactionService.transferStock(dto));
    }

    // ── Manual stock adjustments ──────────────────────────────────────────────
    // POST /inventory_transactions/adjust
    // Body: { productId, warehouseId, quantity, transactionType: "DAMAGE" | "RETURN" | "ADJUSTMENT" }
    @PreAuthorize("hasAuthority('WRITE')")
    @PostMapping("/adjust")
    public ResponseEntity<?> adjustStock(@Valid @RequestBody StockAdjustmentRequestDto dto) {
        return ResponseEntity.ok(stockTransactionService.adjustStock(dto));
    }
}