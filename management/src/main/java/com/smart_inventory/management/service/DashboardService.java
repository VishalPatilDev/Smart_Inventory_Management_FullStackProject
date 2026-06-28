package com.smart_inventory.management.service;


import com.smart_inventory.management.dto.*;
import com.smart_inventory.management.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class DashboardService {

    @Autowired
    private InventoryReportService inventoryReportService;
    @Autowired
    private SalesReportService salesReportService;
    @Autowired
    private PurchaseReportService purchaseReportService;
    @Autowired
    private ProductRepository productRepository;
    @Autowired
    private WarehouseRepository warehouseRepository;
    @Autowired
    private SupplierRepository supplierRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private InventoryRepository inventoryRepository;

    // ── Dashboard Summary ─────────────────────────────────────────────────────
    // One call to GET /reports/dashboard gives a manager everything they need:
    // entity counts, today's sales, low-stock alerts, and inventory value.
    //
    // Returns a Map so we can freely add/remove sections without versioning a DTO.
    public Map<String, Object> getDashboardSummary() {
        Map<String, Object> dashboard = new HashMap<>();

        // ── Section 1: Counts ─────────────────────────────────────────────────
        Map<String, Long> counts = new HashMap<>();
        counts.put("totalProducts",   productRepository.count());
        counts.put("totalWarehouses", warehouseRepository.count());
        counts.put("totalSuppliers",  supplierRepository.count());
        counts.put("totalUsers",      userRepository.count());
        counts.put("totalInventoryRows", inventoryRepository.count());
        dashboard.put("counts", counts);

        // ── Section 2: Today's sales snapshot ────────────────────────────────
        SalesReportSummaryDto todaySales = salesReportService.getTodaysSales();
        dashboard.put("todaySales", Map.of(
                "totalRevenue",    todaySales.getTotalRevenue(),
                "totalGrossProfit", todaySales.getTotalGrossProfit(),
                "ordersPlaced",    todaySales.getTotalOrdersPlaced(),
                "unitsSold",       todaySales.getTotalUnitsSold()
        ));

        // ── Section 3: This month's snapshot ─────────────────────────────────
        SalesReportSummaryDto monthSales = salesReportService.getThisMonthSales();
        dashboard.put("thisMonthSales", Map.of(
                "totalRevenue",    monthSales.getTotalRevenue(),
                "totalGrossProfit", monthSales.getTotalGrossProfit(),
                "ordersPlaced",    monthSales.getTotalOrdersPlaced(),
                "unitsSold",       monthSales.getTotalUnitsSold()
        ));

        // ── Section 4: Low-stock alerts (CRITICAL only on dashboard) ──────────
        List<LowStockAlertDto> criticalAlerts = inventoryReportService.getCriticalStockAlerts();
        dashboard.put("criticalStockAlerts", criticalAlerts);
        dashboard.put("criticalAlertCount", criticalAlerts.size());

        // ── Section 5: Total inventory value ─────────────────────────────────
        List<WarehouseValuationSummaryDto> valuation = inventoryReportService.getValuationByWarehouse();
        double grandTotalCost  = valuation.stream().mapToDouble(WarehouseValuationSummaryDto::getTotalCostValue).sum();
        double grandTotalSale  = valuation.stream().mapToDouble(WarehouseValuationSummaryDto::getTotalSaleValue).sum();
        dashboard.put("inventoryValuation", Map.of(
                "totalCostValue",   grandTotalCost,
                "totalSaleValue",   grandTotalSale,
                "potentialProfit",  grandTotalSale - grandTotalCost,
                "byWarehouse",      valuation
        ));

        // ── Section 6: Top 5 sellers this month ──────────────────────────────
        dashboard.put("topSellersThisMonth",
                salesReportService.getTopSellingProducts(
                        LocalDate.now().withDayOfMonth(1), LocalDate.now(), 5));

        return dashboard;
    }
}
