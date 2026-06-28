package com.smart_inventory.management.service;
import com.smart_inventory.management.custom_exceptions.InsufficientStockException;
import com.smart_inventory.management.custom_exceptions.ResourceNotFoundException;
import com.smart_inventory.management.dto.SalesOrderItemResponseDto;
import com.smart_inventory.management.dto.SalesOrderRequestDto;
import com.smart_inventory.management.dto.SalesOrderResponseDto;
import com.smart_inventory.management.model.*;
import com.smart_inventory.management.repository.*;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class SalesOrderService {

    @Autowired
    private SalesOrderRepository salesOrderRepository;
    @Autowired
    private WarehouseRepository warehouseRepository;
    @Autowired
    private ProductRepository productRepository;
    @Autowired
    private InventoryRepository inventoryRepository;
    @Autowired
    private StockTransactionRepository stockTransactionRepository;
    @Autowired
    private UserRepository userRepository;

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", 0L));
    }

    private SalesOrderResponseDto toDto(SalesOrder order, Warehouse warehouse) {
        List<SalesOrderItemResponseDto> itemDtos = order.getSalesOrderItems()
                .stream()
                .map(item -> SalesOrderItemResponseDto.builder()
                        .id(item.getId())
                        .productName(item.getProduct().getProductName())
                        .sku(item.getProduct().getSku())
                        .quantity(item.getQuantity())
                        .sellingPrice(item.getSellingPrice())
                        .totalPrice(item.getQuantity() * item.getSellingPrice())
                        .build())
                .collect(Collectors.toList());

        double grandTotal = itemDtos.stream().mapToDouble(SalesOrderItemResponseDto::getTotalPrice).sum();

        return SalesOrderResponseDto.builder()
                .id(order.getId())
                .orderDate(order.getOrderDate())
                .warehouseName(warehouse.getWarehouseName())
                .createdBy(order.getCreatedBy().getName())
                .items(itemDtos)
                .grandTotal(grandTotal)
                .build();
    }

    @Transactional
    public SalesOrderResponseDto createSalesOrder(SalesOrderRequestDto dto) {

        Warehouse warehouse = warehouseRepository.findById(dto.getWarehouseId())
                .orElseThrow(() -> new ResourceNotFoundException("Warehouse", dto.getWarehouseId()));

        User currentUser = getCurrentUser();

        // ── Step 1: Validate ALL items have enough stock BEFORE touching anything ──
        // This is critical — we check everything first so we never partially deduct.
        // If Laptop has stock but Mouse doesn't, we reject the whole order upfront.
        dto.getItems().forEach(itemDto -> {
            Product product = productRepository.findById(itemDto.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product", itemDto.getProductId()));

            Inventory inventory = inventoryRepository
                    .findByProductIdAndWarehouseId(product.getId(), warehouse.getId())
                    .orElseThrow(() -> new InsufficientStockException(
                            product.getProductName(), warehouse.getWarehouseName(), itemDto.getQuantity(), 0));

            if (inventory.getQuantity() < itemDto.getQuantity()) {
                throw new InsufficientStockException(
                        product.getProductName(),
                        warehouse.getWarehouseName(),
                        itemDto.getQuantity(),
                        inventory.getQuantity()
                );
            }
        });

        // ── Step 2: All checks passed — now build the order ──────────────────
        SalesOrder order = new SalesOrder();
        order.setOrderDate(LocalDate.now());
        order.setCreatedBy(currentUser);
        order.setWarehouse(warehouse);
        order.setSalesOrderItems(new ArrayList<>());

        dto.getItems().forEach(itemDto -> {
            Product product = productRepository.findById(itemDto.getProductId()).get(); // safe — validated above

            SalesOrderItem item = new SalesOrderItem();
            item.setSalesOrder(order);
            item.setProduct(product);
            item.setQuantity(itemDto.getQuantity());
            // Use product's current selling price at time of sale
            item.setSellingPrice(product.getSellingPrice());
            order.getSalesOrderItems().add(item);

            // ── Step 3: Deduct inventory ──────────────────────────────────────
            Inventory inventory = inventoryRepository
                    .findByProductIdAndWarehouseId(product.getId(), warehouse.getId()).get(); // safe
            inventory.setQuantity(inventory.getQuantity() - itemDto.getQuantity());
            inventoryRepository.save(inventory);

            // ── Step 4: Log transaction ───────────────────────────────────────
            StockTransaction transaction = new StockTransaction();
            transaction.setProduct(product);
            transaction.setWarehouse(warehouse);
            transaction.setQuantity(itemDto.getQuantity());
            transaction.setTransactionType(TransactionType.SALE);
            transaction.setTransactionDate(LocalDateTime.now());
            transaction.setPerformedBy(currentUser);
            stockTransactionRepository.save(transaction);
        });

        salesOrderRepository.save(order);
        return toDto(order, warehouse);
    }

    public List<SalesOrderResponseDto> getAllSalesOrders() {
        return salesOrderRepository.findAll()
                .stream()
                .map(order -> {
                    Inventory inv = inventoryRepository
                            .findByProductId(order.getSalesOrderItems().get(0).getProduct().getId())
                            .stream().findFirst()
                            .orElseThrow(() -> new ResourceNotFoundException("Inventory", 0L));
                    return toDto(order, inv.getWarehouse());
                })
                .collect(Collectors.toList());
    }

    public SalesOrderResponseDto getSalesOrderById(Long id) {
        SalesOrder order = salesOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("SalesOrder", id));
        Inventory inv = inventoryRepository
                .findByProductId(order.getSalesOrderItems().get(0).getProduct().getId())
                .stream().findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Inventory", 0L));
        return toDto(order, inv.getWarehouse());
    }
}