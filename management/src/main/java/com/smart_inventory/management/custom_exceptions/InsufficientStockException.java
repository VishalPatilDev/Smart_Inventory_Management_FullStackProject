package com.smart_inventory.management.custom_exceptions;


// Thrown when a sales order or transfer asks for more stock than is available
public class InsufficientStockException extends RuntimeException {
    public InsufficientStockException(String productName, String warehouseName,
                                      int requested, int available) {
        super("Insufficient stock for '" + productName + "' in '" + warehouseName +
                "'. Requested: " + requested + ", Available: " + available);
    }
}