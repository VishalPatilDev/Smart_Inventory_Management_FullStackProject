package com.smart_inventory.management.custom_exceptions;

// Thrown when trying to create something that already exists (duplicate SKU, category name etc.)
public class DuplicateResourceException extends RuntimeException {
    public DuplicateResourceException(String message) {
        super(message);
    }
}
