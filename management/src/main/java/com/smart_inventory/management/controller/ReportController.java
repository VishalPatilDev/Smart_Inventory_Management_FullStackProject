package com.smart_inventory.management.controller;

import com.smart_inventory.management.service.DashboardService;
import com.smart_inventory.management.service.InventoryReportService;
import com.smart_inventory.management.service.PurchaseReportService;
import com.smart_inventory.management.service.SalesReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/reports")
public class ReportController {

    @Autowired
    private DashboardService dashboardService;
    @Autowired
    private InventoryReportService inventoryReportService;
    @Autowired
    private SalesReportService salesReportService;
    @Autowired
    private PurchaseReportService purchaseReportService;

    // ── Dashboard ─────────────────────────────────────────────────────────────
    // GET /reports/dashboard
    // → counts, today's sales, critical alerts, inventory value, top 5 sellers
    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboard() {
        return ResponseEntity.ok(dashboardService.getDashboardSummary());
    }

    // ── Inventory valuation ───────────────────────────────────────────────────
    // GET /reports/inventory/valuation            → full line-by-line list
    // GET /reports/inventory/valuation/warehouse  → grouped and summed per warehouse
    // GET /reports/inventory/low-stock            → all items at or below threshold
    // GET /reports/inventory/low-stock/critical   → only out-of-stock items

    @GetMapping("/inventory/valuation")
    public ResponseEntity<?> getInventoryValuation() {
        return ResponseEntity.ok(inventoryReportService.getFullValuation());
    }

    @GetMapping("/inventory/valuation/warehouse")
    public ResponseEntity<?> getInventoryValuationByWarehouse() {
        return ResponseEntity.ok(inventoryReportService.getValuationByWarehouse());
    }

    @GetMapping("/inventory/low-stock")
    public ResponseEntity<?> getLowStockAlerts() {
        return ResponseEntity.ok(inventoryReportService.getLowStockAlerts());
    }

    @GetMapping("/inventory/low-stock/critical")
    public ResponseEntity<?> getCriticalStockAlerts() {
        return ResponseEntity.ok(inventoryReportService.getCriticalStockAlerts());
    }

    // ── Sales reports ─────────────────────────────────────────────────────────
    // GET /reports/sales?from=2024-01-01&to=2024-03-31   → custom range
    // GET /reports/sales/today
    // GET /reports/sales/month
    // GET /reports/sales/year
    // GET /reports/sales/top?from=...&to=...&limit=5     → top N products

    @GetMapping("/sales")
    public ResponseEntity<?> getSalesReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResponseEntity.ok(salesReportService.getSalesReport(from, to));
    }

    @GetMapping("/sales/today")
    public ResponseEntity<?> getTodaysSales() {
        return ResponseEntity.ok(salesReportService.getTodaysSales());
    }

    @GetMapping("/sales/month")
    public ResponseEntity<?> getThisMonthSales() {
        return ResponseEntity.ok(salesReportService.getThisMonthSales());
    }

    @GetMapping("/sales/year")
    public ResponseEntity<?> getThisYearSales() {
        return ResponseEntity.ok(salesReportService.getThisYearSales());
    }

    @GetMapping("/sales/top")
    public ResponseEntity<?> getTopSellers(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(defaultValue = "5") int limit) {
        return ResponseEntity.ok(salesReportService.getTopSellingProducts(from, to, limit));
    }

    // ── Purchase reports ──────────────────────────────────────────────────────
    // GET /reports/purchases?from=2024-01-01&to=2024-03-31
    // GET /reports/purchases/month
    // GET /reports/purchases/year
    // GET /reports/purchases/top?from=...&to=...&limit=5

    @PreAuthorize("hasRole('ADMIN')")  // only admins see procurement spend
    @GetMapping("/purchases")
    public ResponseEntity<?> getPurchaseReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResponseEntity.ok(purchaseReportService.getPurchaseReport(from, to));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/purchases/month")
    public ResponseEntity<?> getThisMonthPurchases() {
        return ResponseEntity.ok(purchaseReportService.getThisMonthPurchases());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/purchases/year")
    public ResponseEntity<?> getThisYearPurchases() {
        return ResponseEntity.ok(purchaseReportService.getThisYearPurchases());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/purchases/top")
    public ResponseEntity<?> getTopPurchased(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(defaultValue = "5") int limit) {
        return ResponseEntity.ok(purchaseReportService.getTopPurchasedProducts(from, to, limit));
    }
}