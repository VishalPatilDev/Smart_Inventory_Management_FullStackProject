package com.smart_inventory.management.service;

import com.smart_inventory.management.custom_exceptions.DuplicateResourceException;
import com.smart_inventory.management.custom_exceptions.ResourceNotFoundException;
import com.smart_inventory.management.dto.CategoryRequestDto;
import com.smart_inventory.management.dto.CategoryResponseDto;
import com.smart_inventory.management.model.Category;
import com.smart_inventory.management.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;


@Service
public class CategoryService {

    @Autowired
    private CategoryRepository categoryRepository;

    // ── helpers ──────────────────────────────────────────────────────────────

    // Keep the mapping logic in one place — reused by every method
    private CategoryResponseDto toDto(Category category) {
        return CategoryResponseDto.builder()
                .id(category.getId())
                .name(category.getName())
                .build();
    }

    // ── CRUD ──────────────────────────────────────────────────────────────────

    public CategoryResponseDto createCategory(CategoryRequestDto dto) {
        if (categoryRepository.existsByName(dto.getName())) {
            throw new DuplicateResourceException("Category already exists: " + dto.getName());
        }
        Category category = new Category();
        category.setName(dto.getName());
        categoryRepository.save(category);
        return toDto(category);
    }

    public List<CategoryResponseDto> getAllCategories() {
        return categoryRepository.findAll()
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public CategoryResponseDto getCategoryById(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", id));
        return toDto(category);
    }

    public CategoryResponseDto updateCategory(Long id, CategoryRequestDto dto) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", id));

        // Only check duplicate if name actually changed
        if (!category.getName().equals(dto.getName()) && categoryRepository.existsByName(dto.getName())) {
            throw new DuplicateResourceException("Category already exists: " + dto.getName());
        }

        category.setName(dto.getName());
        categoryRepository.save(category);
        return toDto(category);
    }

    public void deleteCategory(Long id) {
        if (!categoryRepository.existsById(id)) {
            throw new ResourceNotFoundException("Category", id);
        }
        // Note: products in this category will have their FK become invalid if you
        // add cascade. Since Product has no cascade from Category, deletion is safe —
        // but the DB will throw a foreign key constraint error if products still exist.
        // In Phase 3 you can add a check: if products exist, reject the delete.
        categoryRepository.deleteById(id);
    }
}
