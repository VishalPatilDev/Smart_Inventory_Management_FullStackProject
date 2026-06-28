package com.smart_inventory.management.service;

import com.smart_inventory.management.custom_exceptions.InsufficientStockException;
import com.smart_inventory.management.custom_exceptions.ResourceNotFoundException;
import com.smart_inventory.management.dto.*;
import com.smart_inventory.management.model.*;
import com.smart_inventory.management.repository.*;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class StockTransactionService {

    @Autowired
    private StockTransactionRepository stockTransactionRepository;
    @Autowired
    private InventoryRepository inventoryRepository;
    @Autowired
    private ProductRepository productRepository;
    @Autowired
    private WarehouseRepository warehouseRepository;
    @Autowired
    private UserRepository userRepository;

    // Only these types are allowed via the manual adjustment endpoint
    private static final Set<TransactionType> ALLOWED_ADJUSTMENT_TYPES =
            Set.of(TransactionType.DAMAGE, TransactionType.RETURN, TransactionType.ADJUSTMENT);

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", 0L));
    }

    private StockTransactionResponseDto toDto(StockTransaction t) {
        return StockTransactionResponseDto.builder()
                .id(t.getId())
                .productName(t.getProduct().getProductName())
                .sku(t.getProduct().getSku())
                .warehouseName(t.getWarehouse().getWarehouseName())
                .quantity(t.getQuantity())
                .transactionType(t.getTransactionType())
                .transactionDate(t.getTransactionDate())
                .performedBy(t.getPerformedBy().getName())
                .build();
    }

    // ── Transfer between warehouses ───────────────────────────────────────────
    // Moves stock from one warehouse to another.
    // Creates TWO transactions: TRANSFER_OUT from source, TRANSFER_IN to destination.
    @Transactional
    public String transferStock(StockTransferRequestDto dto) {
        if (dto.getFromWarehouseId().equals(dto.getToWarehouseId())) {
            throw new IllegalArgumentException("Source and destination warehouse cannot be the same");
        }

        Product product = productRepository.findById(dto.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product", dto.getProductId()));

        Warehouse fromWarehouse = warehouseRepository.findById(dto.getFromWarehouseId())
                .orElseThrow(() -> new ResourceNotFoundException("Warehouse", dto.getFromWarehouseId()));

        Warehouse toWarehouse = warehouseRepository.findById(dto.getToWarehouseId())
                .orElseThrow(() -> new ResourceNotFoundException("Warehouse", dto.getToWarehouseId()));

        User currentUser = getCurrentUser();

        // Check source has enough stock
        Inventory sourceInventory = inventoryRepository
                .findByProductIdAndWarehouseId(product.getId(), fromWarehouse.getId())
                .orElseThrow(() -> new InsufficientStockException(
                        product.getProductName(), fromWarehouse.getWarehouseName(), dto.getQuantity(), 0));

        if (sourceInventory.getQuantity() < dto.getQuantity()) {
            throw new InsufficientStockException(
                    product.getProductName(),
                    fromWarehouse.getWarehouseName(),
                    dto.getQuantity(),
                    sourceInventory.getQuantity()
            );
        }

        // Deduct from source
        sourceInventory.setQuantity(sourceInventory.getQuantity() - dto.getQuantity());
        inventoryRepository.save(sourceInventory);

        // Add to destination (create row if this product is new to that warehouse)
        Inventory destInventory = inventoryRepository
                .findByProductIdAndWarehouseId(product.getId(), toWarehouse.getId())
                .orElseGet(() -> {
                    Inventory newInv = new Inventory();
                    newInv.setProduct(product);
                    newInv.setWarehouse(toWarehouse);
                    newInv.setQuantity(0);
                    newInv.setReorderThreshold(10);
                    return newInv;
                });
        destInventory.setQuantity(destInventory.getQuantity() + dto.getQuantity());
        inventoryRepository.save(destInventory);

        // Log TRANSFER_OUT
        StockTransaction out = new StockTransaction();
        out.setProduct(product);
        out.setWarehouse(fromWarehouse);
        out.setQuantity(dto.getQuantity());
        out.setTransactionType(TransactionType.TRANSFER_OUT);
        out.setTransactionDate(LocalDateTime.now());
        out.setPerformedBy(currentUser);
        stockTransactionRepository.save(out);

        // Log TRANSFER_IN
        StockTransaction in = new StockTransaction();
        in.setProduct(product);
        in.setWarehouse(toWarehouse);
        in.setQuantity(dto.getQuantity());
        in.setTransactionType(TransactionType.TRANSFER_IN);
        in.setTransactionDate(LocalDateTime.now());
        in.setPerformedBy(currentUser);
        stockTransactionRepository.save(in);

        return "Transferred " + dto.getQuantity() + " units of '" + product.getProductName()
                + "' from " + fromWarehouse.getWarehouseName()
                + " to " + toWarehouse.getWarehouseName();
    }

    // ── Manual adjustments (DAMAGE / RETURN / ADJUSTMENT) ────────────────────
    // DAMAGE  → removes stock (broken goods)
    // RETURN  → adds stock back (customer return)
    // ADJUSTMENT → can add or remove (manual correction after stocktake)
    @Transactional
    public StockTransactionResponseDto adjustStock(StockAdjustmentRequestDto dto) {
        if (!ALLOWED_ADJUSTMENT_TYPES.contains(dto.getTransactionType())) {
            throw new IllegalArgumentException(
                    "Only DAMAGE, RETURN, ADJUSTMENT types are allowed here. " +
                            "PURCHASE and SALE go through their respective order endpoints.");
        }

        Product product = productRepository.findById(dto.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product", dto.getProductId()));

        Warehouse warehouse = warehouseRepository.findById(dto.getWarehouseId())
                .orElseThrow(() -> new ResourceNotFoundException("Warehouse", dto.getWarehouseId()));

        Inventory inventory = inventoryRepository
                .findByProductIdAndWarehouseId(product.getId(), warehouse.getId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Inventory for product " + product.getProductName() + " in warehouse " + warehouse.getWarehouseName(), 0L));

        User currentUser = getCurrentUser();

        // DAMAGE removes stock; RETURN adds it back; ADJUSTMENT adds (use negative quantity in future for removal)
        if (dto.getTransactionType() == TransactionType.DAMAGE) {
            if (inventory.getQuantity() < dto.getQuantity()) {
                throw new InsufficientStockException(
                        product.getProductName(), warehouse.getWarehouseName(),
                        dto.getQuantity(), inventory.getQuantity());
            }
            inventory.setQuantity(inventory.getQuantity() - dto.getQuantity());
        } else {
            // RETURN or ADJUSTMENT — adds stock
            inventory.setQuantity(inventory.getQuantity() + dto.getQuantity());
        }
        inventoryRepository.save(inventory);

        StockTransaction transaction = new StockTransaction();
        transaction.setProduct(product);
        transaction.setWarehouse(warehouse);
        transaction.setQuantity(dto.getQuantity());
        transaction.setTransactionType(dto.getTransactionType());
        transaction.setTransactionDate(LocalDateTime.now());
        transaction.setPerformedBy(currentUser);
        stockTransactionRepository.save(transaction);

        return toDto(transaction);
    }

    // ── Audit trail queries ───────────────────────────────────────────────────

    public List<StockTransactionResponseDto> getAllTransactions() {
        return stockTransactionRepository.findAll()
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    public List<StockTransactionResponseDto> getTransactionsByProduct(Long productId) {
        if (!productRepository.existsById(productId)) throw new ResourceNotFoundException("Product", productId);
        return stockTransactionRepository.findByProductId(productId)
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    public List<StockTransactionResponseDto> getTransactionsByWarehouse(Long warehouseId) {
        if (!warehouseRepository.existsById(warehouseId)) throw new ResourceNotFoundException("Warehouse", warehouseId);
        return stockTransactionRepository.findByWarehouseId(warehouseId)
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    public List<StockTransactionResponseDto> getTransactionsByType(TransactionType type) {
        return stockTransactionRepository.findByTransactionType(type)
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    public List<StockTransactionResponseDto> getTransactionsByDateRange(LocalDateTime from, LocalDateTime to) {
        return stockTransactionRepository.findByTransactionDateBetween(from, to)
                .stream().map(this::toDto).collect(Collectors.toList());
    }
}
