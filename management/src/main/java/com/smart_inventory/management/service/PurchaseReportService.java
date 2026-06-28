package com.smart_inventory.management.service;


import com.smart_inventory.management.dto.PurchaseReportItemDto;
import com.smart_inventory.management.dto.PurchaseReportSummaryDto;
import com.smart_inventory.management.dto.TopProductDto;
import com.smart_inventory.management.model.PurchaseOrderItem;
import com.smart_inventory.management.repository.PurchaseOrderItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class PurchaseReportService {

    @Autowired
    private PurchaseOrderItemRepository purchaseOrderItemRepository;

    // ── Purchase Report ───────────────────────────────────────────────────────
    // "How much stock did we buy and spend between two dates?"
    //
    // Called with:  GET /reports/purchases?from=2024-01-01&to=2024-03-31
    public PurchaseReportSummaryDto getPurchaseReport(LocalDate from, LocalDate to) {
        List<PurchaseOrderItem> items = purchaseOrderItemRepository.findItemsBetweenDates(from, to);

        // Group by product — aggregate all purchase order items for the same product
        Map<Long, List<PurchaseOrderItem>> byProduct = items.stream()
                .collect(Collectors.groupingBy(i -> i.getProduct().getId()));

        List<PurchaseReportItemDto> reportItems = byProduct.values().stream()
                .map(productItems -> {
                    PurchaseOrderItem first = productItems.get(0);
                    int totalQty    = productItems.stream().mapToInt(PurchaseOrderItem::getQuantity).sum();
                    double totalAmt = productItems.stream()
                            .mapToDouble(i -> i.getQuantity() * i.getPrice()).sum();
                    return PurchaseReportItemDto.builder()
                            .productName(first.getProduct().getProductName())
                            .sku(first.getProduct().getSku())
                            .supplierName(first.getProduct().getSupplier().getSupplierName())
                            .totalQuantityPurchased(totalQty)
                            .totalAmountSpent(totalAmt)
                            .build();
                })
                // Sort by amount spent descending
                .sorted((a, b) -> Double.compare(b.getTotalAmountSpent(), a.getTotalAmountSpent()))
                .collect(Collectors.toList());

        double totalSpent     = reportItems.stream().mapToDouble(PurchaseReportItemDto::getTotalAmountSpent).sum();
        int totalUnits        = reportItems.stream().mapToInt(PurchaseReportItemDto::getTotalQuantityPurchased).sum();
        long totalOrders      = purchaseOrderItemRepository.countOrdersBetweenDates(from, to);

        return PurchaseReportSummaryDto.builder()
                .from(from)
                .to(to)
                .items(reportItems)
                .totalAmountSpent(totalSpent)
                .totalOrdersPlaced((int) totalOrders)
                .totalUnitsPurchased(totalUnits)
                .build();
    }

    // ── Top Purchased Products ────────────────────────────────────────────────
    // "What did we buy the most of?" — helps with procurement planning
    public List<TopProductDto> getTopPurchasedProducts(LocalDate from, LocalDate to, int limit) {
        return purchaseOrderItemRepository.findTopPurchasedProducts(from, to)
                .stream()
                .limit(limit)
                .map(row -> TopProductDto.builder()
                        .productName((String) row[1])
                        .sku((String) row[2])
                        .categoryName((String) row[3])
                        .totalQuantity(((Number) row[4]).intValue())
                        .totalValue(((Number) row[5]).doubleValue())
                        .build())
                .collect(Collectors.toList());
    }

    public PurchaseReportSummaryDto getThisMonthPurchases() {
        LocalDate start = LocalDate.now().withDayOfMonth(1);
        LocalDate end   = LocalDate.now();
        return getPurchaseReport(start, end);
    }

    public PurchaseReportSummaryDto getThisYearPurchases() {
        LocalDate start = LocalDate.now().withDayOfYear(1);
        LocalDate end   = LocalDate.now();
        return getPurchaseReport(start, end);
    }
}
