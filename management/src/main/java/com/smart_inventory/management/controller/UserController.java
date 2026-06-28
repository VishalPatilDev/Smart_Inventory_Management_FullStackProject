package com.smart_inventory.management.controller;

import com.smart_inventory.management.dto.UserRequestDto;
import com.smart_inventory.management.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("inventory_user")
public class UserController {
    @Autowired
    private UserService userService;

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/users")
    public ResponseEntity<?> fetchUsers(){
        return ResponseEntity.status(HttpStatus.OK)
                .body(userService.fetchUsers());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getUserById(@PathVariable Long id){
        return ResponseEntity.status(HttpStatus.OK)
                .body(userService.getUserById(id));
    }

    @PreAuthorize("hasAuthority('DELETE')")
    @DeleteMapping("delete/{id}")
    public ResponseEntity<?> deleteById(@PathVariable Long id){
        return ResponseEntity.status(HttpStatus.OK)
                .body("Deleted!! \n"+userService.deleteById(id)+" \n Deleted !");
    }

    @PreAuthorize("hasAuthority('WRITE')")
    @PutMapping("update/{id}")
    public ResponseEntity<?> updateById(@Valid @RequestBody UserRequestDto userRequestDto, @PathVariable Long id){
        return ResponseEntity.status(HttpStatus.OK)
                .body(userService.updateById(userRequestDto,id));
    }
}
