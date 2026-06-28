package com.smart_inventory.management.service;

import com.smart_inventory.management.dto.InventoryValuationDto;
import com.smart_inventory.management.dto.LowStockAlertDto;
import com.smart_inventory.management.dto.WarehouseValuationSummaryDto;
import com.smart_inventory.management.model.Inventory;
import com.smart_inventory.management.repository.InventoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class InventoryReportService {

    @Autowired
    private InventoryRepository inventoryRepository;

    // ── Inventory Valuation ───────────────────────────────────────────────────
    // "What is the current stock worth across all warehouses?"

    public List<InventoryValuationDto> getFullValuation() {
        return inventoryRepository.findAll()
                .stream()
                .map(this::toValuationDto)
                .collect(Collectors.toList());
    }

    // Grouped by warehouse — most useful for management reports
    // e.g. "Mumbai warehouse holds ₹12,00,000 worth of stock"
    public List<WarehouseValuationSummaryDto> getValuationByWarehouse() {
        List<Inventory> allInventory = inventoryRepository.findAll();

        // Group all inventory rows by warehouse name
        Map<String, List<Inventory>> byWarehouse = allInventory.stream()
                .collect(Collectors.groupingBy(inv -> inv.getWarehouse().getWarehouseName()));

        return byWarehouse.entrySet().stream()
                .map(entry -> {
                    String warehouseName = entry.getKey();
                    List<Inventory> items = entry.getValue();

                    List<InventoryValuationDto> itemDtos = items.stream()
                            .map(this::toValuationDto)
                            .collect(Collectors.toList());

                    double totalCost  = itemDtos.stream().mapToDouble(InventoryValuationDto::getTotalCostValue).sum();
                    double totalSale  = itemDtos.stream().mapToDouble(InventoryValuationDto::getTotalSaleValue).sum();
                    int totalUnits    = items.stream().mapToInt(Inventory::getQuantity).sum();

                    return WarehouseValuationSummaryDto.builder()
                            .warehouseName(warehouseName)
                            .items(itemDtos)
                            .totalCostValue(totalCost)
                            .totalSaleValue(totalSale)
                            .totalPotentialProfit(totalSale - totalCost)
                            .totalProducts(items.size())
                            .totalUnits(totalUnits)
                            .build();
                })
                // Sort by warehouse name alphabetically
                .sorted(Comparator.comparing(WarehouseValuationSummaryDto::getWarehouseName))
                .collect(Collectors.toList());
    }

    private InventoryValuationDto toValuationDto(Inventory inv) {
        double costValue  = inv.getQuantity() * inv.getProduct().getPurchasePrice();
        double saleValue  = inv.getQuantity() * inv.getProduct().getSellingPrice();
        return InventoryValuationDto.builder()
                .warehouseName(inv.getWarehouse().getWarehouseName())
                .productName(inv.getProduct().getProductName())
                .sku(inv.getProduct().getSku())
                .quantity(inv.getQuantity())
                .purchasePrice(inv.getProduct().getPurchasePrice())
                .sellingPrice(inv.getProduct().getSellingPrice())
                .totalCostValue(costValue)
                .totalSaleValue(saleValue)
                .potentialProfit(saleValue - costValue)
                .build();
    }

    // ── Low Stock Alerts ──────────────────────────────────────────────────────
    // "Which products need to be reordered?"

    public List<LowStockAlertDto> getLowStockAlerts() {
        return inventoryRepository.findLowStockItems()
                .stream()
                .map(inv -> {
                    int shortfall = inv.getReorderThreshold() - inv.getQuantity();
                    String urgency = inv.getQuantity() == 0 ? "CRITICAL" : "LOW";
                    return LowStockAlertDto.builder()
                            .productId(inv.getProduct().getId())
                            .productName(inv.getProduct().getProductName())
                            .sku(inv.getProduct().getSku())
                            .supplierName(inv.getProduct().getSupplier().getSupplierName())
                            .warehouseName(inv.getWarehouse().getWarehouseName())
                            .currentQuantity(inv.getQuantity())
                            .reorderThreshold(inv.getReorderThreshold())
                            .shortfall(shortfall)
                            .urgency(urgency)
                            .build();
                })
                // Show CRITICAL items first, then by shortfall size
                .sorted(Comparator
                        .comparing(LowStockAlertDto::getUrgency)     // CRITICAL before LOW alphabetically
                        .thenComparing(Comparator.comparingInt(LowStockAlertDto::getShortfall).reversed()))
                .collect(Collectors.toList());
    }

    public List<LowStockAlertDto> getCriticalStockAlerts() {
        return getLowStockAlerts().stream()
                .filter(a -> "CRITICAL".equals(a.getUrgency()))
                .collect(Collectors.toList());
    }
}
