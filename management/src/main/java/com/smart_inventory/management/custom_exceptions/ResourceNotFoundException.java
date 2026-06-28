package com.smart_inventory.management.custom_exceptions;

// One generic exception for "thing not found" — works for Category, Product, Warehouse etc.
// Usage: throw new ResourceNotFoundException("Product", 42L)
// Message: "Product not found with id: 42"
public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String resourceName, Long id) {
        super(resourceName + " not found with id: " + id);
    }
}
