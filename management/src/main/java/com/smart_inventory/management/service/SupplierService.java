package com.smart_inventory.management.service;


import com.smart_inventory.management.custom_exceptions.DuplicateResourceException;
import com.smart_inventory.management.custom_exceptions.ResourceNotFoundException;
import com.smart_inventory.management.dto.SupplierRequestDto;
import com.smart_inventory.management.dto.SupplierResponseDto;
import com.smart_inventory.management.model.Supplier;
import com.smart_inventory.management.repository.SupplierRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class SupplierService {

    @Autowired
    private SupplierRepository supplierRepository;

    private SupplierResponseDto toDto(Supplier supplier) {
        return SupplierResponseDto.builder()
                .id(supplier.getId())
                .supplierName(supplier.getSupplierName())
                .email(supplier.getEmail())
                .phone(supplier.getPhone())
                .build();
    }

    public SupplierResponseDto createSupplier(SupplierRequestDto dto) {
        if (supplierRepository.existsBySupplierName(dto.getSupplierName())) {
            throw new DuplicateResourceException("Supplier already exists: " + dto.getSupplierName());
        }
        Supplier supplier = new Supplier();
        supplier.setSupplierName(dto.getSupplierName());
        supplier.setEmail(dto.getEmail());
        supplier.setPhone(dto.getPhone());
        supplierRepository.save(supplier);
        return toDto(supplier);
    }

    public List<SupplierResponseDto> getAllSuppliers() {
        return supplierRepository.findAll()
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public SupplierResponseDto getSupplierById(Long id) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier", id));
        return toDto(supplier);
    }

    public SupplierResponseDto updateSupplier(Long id, SupplierRequestDto dto) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier", id));
        supplier.setSupplierName(dto.getSupplierName());
        supplier.setEmail(dto.getEmail());
        supplier.setPhone(dto.getPhone());
        supplierRepository.save(supplier);
        return toDto(supplier);
    }

    public void deleteSupplier(Long id) {
        if (!supplierRepository.existsById(id)) {
            throw new ResourceNotFoundException("Supplier", id);
        }
        supplierRepository.deleteById(id);
    }
}
