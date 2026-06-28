package com.smart_inventory.management.service;


import com.smart_inventory.management.custom_exceptions.DuplicateResourceException;
import com.smart_inventory.management.custom_exceptions.ResourceNotFoundException;
import com.smart_inventory.management.dto.WarehouseRequestDto;
import com.smart_inventory.management.dto.WarehouseResponseDto;
import com.smart_inventory.management.model.Warehouse;
import com.smart_inventory.management.repository.WarehouseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class WarehouseService {

    @Autowired
    private WarehouseRepository warehouseRepository;

    private WarehouseResponseDto toDto(Warehouse warehouse) {
        return WarehouseResponseDto.builder()
                .id(warehouse.getId())
                .warehouseName(warehouse.getWarehouseName())
                .address(warehouse.getAddress())
                .build();
    }

    public WarehouseResponseDto createWarehouse(WarehouseRequestDto dto) {
        if (warehouseRepository.existsByWarehouseName(dto.getWarehouseName())) {
            throw new DuplicateResourceException("Warehouse already exists: " + dto.getWarehouseName());
        }
        Warehouse warehouse = new Warehouse();
        warehouse.setWarehouseName(dto.getWarehouseName());
        warehouse.setAddress(dto.getAddress());
        warehouseRepository.save(warehouse);
        return toDto(warehouse);
    }

    public List<WarehouseResponseDto> getAllWarehouses() {
        return warehouseRepository.findAll()
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public WarehouseResponseDto getWarehouseById(Long id) {
        Warehouse warehouse = warehouseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Warehouse", id));
        return toDto(warehouse);
    }

    public WarehouseResponseDto updateWarehouse(Long id, WarehouseRequestDto dto) {
        Warehouse warehouse = warehouseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Warehouse", id));
        warehouse.setWarehouseName(dto.getWarehouseName());
        warehouse.setAddress(dto.getAddress());
        warehouseRepository.save(warehouse);
        return toDto(warehouse);
    }

    public void deleteWarehouse(Long id) {
        if (!warehouseRepository.existsById(id)) {
            throw new ResourceNotFoundException("Warehouse", id);
        }
        // CascadeType.ALL on inventories — deletes all inventory rows for this warehouse too
        warehouseRepository.deleteById(id);
    }
}

