package com.smart_inventory.management.service;


import com.smart_inventory.management.custom_exceptions.ResourceNotFoundException;
import com.smart_inventory.management.dto.PurchaseOrderItemResponseDto;
import com.smart_inventory.management.dto.PurchaseOrderRequestDto;
import com.smart_inventory.management.dto.PurchaseOrderResponseDto;
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
public class PurchaseOrderService {

    @Autowired
    private PurchaseOrderRepository purchaseOrderRepository;
    @Autowired
    private SupplierRepository supplierRepository;
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

    // ── helpers ──────────────────────────────────────────────────────────────

    // Get the logged-in user from the JWT security context
    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", 0L));
    }

    private PurchaseOrderResponseDto toDto(PurchaseOrder order, Warehouse warehouse) {
        List<PurchaseOrderItemResponseDto> itemDtos = order.getPurchaseOrderItems()
                .stream()
                .map(item -> PurchaseOrderItemResponseDto.builder()
                        .id(item.getId())
                        .productName(item.getProduct().getProductName())
                        .sku(item.getProduct().getSku())
                        .quantity(item.getQuantity())
                        .price(item.getPrice())
                        .totalPrice(item.getQuantity() * item.getPrice())
                        .build())
                .collect(Collectors.toList());

        double grandTotal = itemDtos.stream().mapToDouble(PurchaseOrderItemResponseDto::getTotalPrice).sum();

        return PurchaseOrderResponseDto.builder()
                .id(order.getId())
                .orderDate(order.getOrderDate())
                .supplierName(order.getSupplier().getSupplierName())
                .warehouseName(warehouse.getWarehouseName())
                .createdBy(order.getCreatedBy().getName())
                .items(itemDtos)
                .grandTotal(grandTotal)
                .build();
    }

    // ── main operations ───────────────────────────────────────────────────────

    // @Transactional ensures ALL of this succeeds or ALL rolls back.
    // If any step fails (e.g. product not found halfway through), nothing is saved.
    @Transactional
    public PurchaseOrderResponseDto createPurchaseOrder(PurchaseOrderRequestDto dto) {

        Supplier supplier = supplierRepository.findById(dto.getSupplierId())
                .orElseThrow(() -> new ResourceNotFoundException("Supplier", dto.getSupplierId()));

        Warehouse warehouse = warehouseRepository.findById(dto.getWarehouseId())
                .orElseThrow(() -> new ResourceNotFoundException("Warehouse", dto.getWarehouseId()));

        User currentUser = getCurrentUser();

        // ── Step 1: Build the PurchaseOrder header ────────────────────────────
        PurchaseOrder order = new PurchaseOrder();
        order.setOrderDate(LocalDate.now());
        order.setSupplier(supplier);
        order.setCreatedBy(currentUser);
        order.setWarehouse(warehouse);
        order.setPurchaseOrderItems(new ArrayList<>());

        // ── Step 2: Build each line item ──────────────────────────────────────
        dto.getItems().forEach(itemDto -> {
            Product product = productRepository.findById(itemDto.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product", itemDto.getProductId()));

            PurchaseOrderItem item = new PurchaseOrderItem();
            item.setPurchaseOrder(order);
            item.setProduct(product);
            item.setQuantity(itemDto.getQuantity());
            // Use product's current purchase price at time of purchase
            item.setPrice(product.getPurchasePrice());
            order.getPurchaseOrderItems().add(item);

            // ── Step 3: Increase inventory ────────────────────────────────────
            // Find existing inventory row for this product+warehouse, or create one
            Inventory inventory = inventoryRepository
                    .findByProductIdAndWarehouseId(product.getId(), warehouse.getId())
                    .orElseGet(() -> {
                        // First time this product is received at this warehouse
                        Inventory newInventory = new Inventory();
                        newInventory.setProduct(product);
                        newInventory.setWarehouse(warehouse);
                        newInventory.setQuantity(0);
                        newInventory.setReorderThreshold(10); // sensible default
                        return newInventory;
                    });

            inventory.setQuantity(inventory.getQuantity() + itemDto.getQuantity());
            inventoryRepository.save(inventory);

            // ── Step 4: Log the stock transaction ─────────────────────────────
            StockTransaction transaction = new StockTransaction();
            transaction.setProduct(product);
            transaction.setWarehouse(warehouse);
            transaction.setQuantity(itemDto.getQuantity());
            transaction.setTransactionType(TransactionType.PURCHASE);
            transaction.setTransactionDate(LocalDateTime.now());
            transaction.setPerformedBy(currentUser);
            stockTransactionRepository.save(transaction);
        });

        purchaseOrderRepository.save(order);
        return toDto(order, warehouse);
    }

    public List<PurchaseOrderResponseDto> getAllPurchaseOrders() {
        // For the toDto we need the warehouse — but PurchaseOrder doesn't store it directly.
        // We find the warehouse from the first stock transaction logged for this order.
        // A cleaner long-term fix: add warehouseId to PurchaseOrder entity.
        // For now we use a simpler approach — see note in controller comments.
        return purchaseOrderRepository.findAll()
                .stream()
                .map(order -> {
                    // Derive warehouse from the first transaction linked to the first item
                    Inventory inv = inventoryRepository
                            .findByProductId(order.getPurchaseOrderItems().get(0).getProduct().getId())
                            .stream().findFirst()
                            .orElseThrow(() -> new ResourceNotFoundException("Inventory", 0L));
                    return toDto(order, inv.getWarehouse());
                })
                .collect(Collectors.toList());
    }

    public PurchaseOrderResponseDto getPurchaseOrderById(Long id) {
        PurchaseOrder order = purchaseOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("PurchaseOrder", id));
        Inventory inv = inventoryRepository
                .findByProductId(order.getPurchaseOrderItems().get(0).getProduct().getId())
                .stream().findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Inventory", 0L));
        return toDto(order, inv.getWarehouse());
    }
}