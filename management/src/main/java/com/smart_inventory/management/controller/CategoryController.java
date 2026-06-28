package com.smart_inventory.management.controller;

import com.smart_inventory.management.dto.CategoryRequestDto;
import com.smart_inventory.management.service.CategoryService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/inventory_category")
public class CategoryController {

    @Autowired
    private CategoryService categoryService;

    // Any authenticated user can view categories
    @GetMapping
    public ResponseEntity<?> getAllCategories() {
        return ResponseEntity.ok(categoryService.getAllCategories());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getCategoryById(@PathVariable Long id) {
        return ResponseEntity.ok(categoryService.getCategoryById(id));
    }

    // Only ADMIN can create, update, delete
    @PreAuthorize("hasAuthority('WRITE')")
    @PostMapping
    public ResponseEntity<?> createCategory(@Valid @RequestBody CategoryRequestDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(categoryService.createCategory(dto));
    }

    @PreAuthorize("hasAuthority('WRITE')")
    @PutMapping("/{id}")
    public ResponseEntity<?> updateCategory(@PathVariable Long id,
                                            @Valid @RequestBody CategoryRequestDto dto) {
        return ResponseEntity.ok(categoryService.updateCategory(id, dto));
    }

    @PreAuthorize("hasAuthority('DELETE')")
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCategory(@PathVariable Long id) {
        categoryService.deleteCategory(id);
        return ResponseEntity.ok("Category deleted successfully");
    }
}
