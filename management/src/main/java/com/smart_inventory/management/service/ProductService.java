package com.smart_inventory.management.service;

import com.smart_inventory.management.custom_exceptions.DuplicateResourceException;
import com.smart_inventory.management.custom_exceptions.ResourceNotFoundException;
import com.smart_inventory.management.dto.ProductRequestDto;
import com.smart_inventory.management.dto.ProductResponseDto;
import com.smart_inventory.management.model.Category;
import com.smart_inventory.management.model.Product;
import com.smart_inventory.management.model.Supplier;
import com.smart_inventory.management.repository.CategoryRepository;
import com.smart_inventory.management.repository.ProductRepository;
import com.smart_inventory.management.repository.SupplierRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;
    @Autowired
    private CategoryRepository categoryRepository;
    @Autowired
    private SupplierRepository supplierRepository;

    private ProductResponseDto toDto(Product product) {
        return ProductResponseDto.builder()
                .id(product.getId())
                .productName(product.getProductName())
                .sku(product.getSku())
                .purchasePrice(product.getPurchasePrice())
                .sellingPrice(product.getSellingPrice())
                // We only expose names, not full nested objects
                .categoryName(product.getCategory().getName())
                .supplierName(product.getSupplier().getSupplierName())
                .build();
    }

    public ProductResponseDto createProduct(ProductRequestDto dto) {
        if (productRepository.existsBySku(dto.getSku())) {
            throw new DuplicateResourceException("SKU already exists: " + dto.getSku());
        }

        Category category = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category", dto.getCategoryId()));

        Supplier supplier = supplierRepository.findById(dto.getSupplierId())
                .orElseThrow(() -> new ResourceNotFoundException("Supplier", dto.getSupplierId()));

        Product product = new Product();
        product.setProductName(dto.getProductName());
        product.setSku(dto.getSku());
        product.setPurchasePrice(dto.getPurchasePrice());
        product.setSellingPrice(dto.getSellingPrice());
        product.setCategory(category);
        product.setSupplier(supplier);
        productRepository.save(product);
        return toDto(product);
    }

    public List<ProductResponseDto> getAllProducts() {
        return productRepository.findAll()
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public ProductResponseDto getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", id));
        return toDto(product);
    }

    public ProductResponseDto getProductBySku(String sku) {
        Product product = productRepository.findBySku(sku)
                .orElseThrow(() -> new ResourceNotFoundException("Product with SKU " + sku, 0L));
        return toDto(product);
    }

    // Useful for browsing: "show me all laptops" → GET /products?categoryId=1
    public List<ProductResponseDto> getProductsByCategory(Long categoryId) {
        if (!categoryRepository.existsById(categoryId)) {
            throw new ResourceNotFoundException("Category", categoryId);
        }
        return productRepository.findByCategoryId(categoryId)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    // Useful for procurement: "what does Dell supply?" → GET /products?supplierId=2
    public List<ProductResponseDto> getProductsBySupplier(Long supplierId) {
        if (!supplierRepository.existsById(supplierId)) {
            throw new ResourceNotFoundException("Supplier", supplierId);
        }
        return productRepository.findBySupplierId(supplierId)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public ProductResponseDto updateProduct(Long id, ProductRequestDto dto) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", id));

        // Only reject duplicate SKU if it belongs to a DIFFERENT product
        if (!product.getSku().equals(dto.getSku()) && productRepository.existsBySku(dto.getSku())) {
            throw new DuplicateResourceException("SKU already exists: " + dto.getSku());
        }

        Category category = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category", dto.getCategoryId()));

        Supplier supplier = supplierRepository.findById(dto.getSupplierId())
                .orElseThrow(() -> new ResourceNotFoundException("Supplier", dto.getSupplierId()));

        product.setProductName(dto.getProductName());
        product.setSku(dto.getSku());
        product.setPurchasePrice(dto.getPurchasePrice());
        product.setSellingPrice(dto.getSellingPrice());
        product.setCategory(category);
        product.setSupplier(supplier);
        productRepository.save(product);
        return toDto(product);
    }

    public void deleteProduct(Long id) {
        if (!productRepository.existsById(id)) {
            throw new ResourceNotFoundException("Product", id);
        }
        // CascadeType.ALL on inventories means deleting the product
        // automatically deletes all its inventory rows — intentional.
        productRepository.deleteById(id);
    }
}