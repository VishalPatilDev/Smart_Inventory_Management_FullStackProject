package com.smart_inventory.management.service;

import com.smart_inventory.management.dto.SalesReportItemDto;
import com.smart_inventory.management.dto.SalesReportSummaryDto;
import com.smart_inventory.management.dto.TopProductDto;
import com.smart_inventory.management.model.SalesOrderItem;
import com.smart_inventory.management.repository.SalesOrderItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class SalesReportService {

    @Autowired
    private SalesOrderItemRepository salesOrderItemRepository;

    // ── Sales Report ──────────────────────────────────────────────────────────
    // "How much did we sell and earn between two dates?"
    //
    // Called with:  GET /reports/sales?from=2024-01-01&to=2024-03-31
    public SalesReportSummaryDto getSalesReport(LocalDate from, LocalDate to) {
        List<SalesOrderItem> items = salesOrderItemRepository.findItemsBetweenDates(from, to);

        // Group by product — one product can appear across many orders
        // We want one row per product in the report, not one row per order item
        Map<Long, List<SalesOrderItem>> byProduct = items.stream()
                .collect(Collectors.groupingBy(i -> i.getProduct().getId()));

        List<SalesReportItemDto> reportItems = byProduct.values().stream()
                .map(productItems -> {
                    SalesOrderItem first = productItems.get(0);
                    int totalQty = productItems.stream().mapToInt(SalesOrderItem::getQuantity).sum();
                    double revenue = productItems.stream()
                            .mapToDouble(i -> i.getQuantity() * i.getSellingPrice()).sum();
                    double cost = totalQty * first.getProduct().getPurchasePrice();

                    return SalesReportItemDto.builder()
                            .productName(first.getProduct().getProductName())
                            .sku(first.getProduct().getSku())
                            .totalQuantitySold(totalQty)
                            .revenueGenerated(revenue)
                            .costOfGoods(cost)
                            .grossProfit(revenue - cost)
                            .build();
                })
                // Sort by revenue descending — biggest earner first
                .sorted((a, b) -> Double.compare(b.getRevenueGenerated(), a.getRevenueGenerated()))
                .collect(Collectors.toList());

        double totalRevenue    = reportItems.stream().mapToDouble(SalesReportItemDto::getRevenueGenerated).sum();
        double totalCost       = reportItems.stream().mapToDouble(SalesReportItemDto::getCostOfGoods).sum();
        int totalUnitsSold     = reportItems.stream().mapToInt(SalesReportItemDto::getTotalQuantitySold).sum();
        long totalOrders       = salesOrderItemRepository.countOrdersBetweenDates(from, to);

        return SalesReportSummaryDto.builder()
                .from(from)
                .to(to)
                .items(reportItems)
                .totalRevenue(totalRevenue)
                .totalCostOfGoods(totalCost)
                .totalGrossProfit(totalRevenue - totalCost)
                .totalOrdersPlaced((int) totalOrders)
                .totalUnitsSold(totalUnitsSold)
                .build();
    }

    // ── Top Sellers ───────────────────────────────────────────────────────────
    // "What are our N best selling products?"
    //
    // Called with:  GET /reports/sales/top?from=2024-01-01&to=2024-03-31&limit=5
    public List<TopProductDto> getTopSellingProducts(LocalDate from, LocalDate to, int limit) {
        return salesOrderItemRepository.findTopSellingProducts(from, to)
                .stream()
                .limit(limit)
                .map(row -> TopProductDto.builder()
                        // row[0]=productId, [1]=name, [2]=sku, [3]=category, [4]=qty, [5]=revenue
                        .productName((String) row[1])
                        .sku((String) row[2])
                        .categoryName((String) row[3])
                        .totalQuantity(((Number) row[4]).intValue())
                        .totalValue(((Number) row[5]).doubleValue())
                        .build())
                .collect(Collectors.toList());
    }

    // ── Convenience shortcuts ─────────────────────────────────────────────────

    public SalesReportSummaryDto getTodaysSales() {
        LocalDate today = LocalDate.now();
        return getSalesReport(today, today);
    }

    public SalesReportSummaryDto getThisMonthSales() {
        LocalDate start = LocalDate.now().withDayOfMonth(1);
        LocalDate end   = LocalDate.now();
        return getSalesReport(start, end);
    }

    public SalesReportSummaryDto getThisYearSales() {
        LocalDate start = LocalDate.now().withDayOfYear(1);
        LocalDate end   = LocalDate.now();
        return getSalesReport(start, end);
    }
}
