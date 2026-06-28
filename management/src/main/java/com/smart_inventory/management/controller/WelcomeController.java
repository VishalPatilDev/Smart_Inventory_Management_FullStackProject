package com.smart_inventory.management.controller;

import com.smart_inventory.management.dto.AuthenticateUserDto;
import com.smart_inventory.management.dto.UserRequestDto;
import com.smart_inventory.management.service.UserService;
import com.smart_inventory.management.util.JWTUtil;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;

@RestController
@RequestMapping("/inventory_welcome")
public class WelcomeController {
    @Autowired
    private UserService userService;
    @Autowired
    private AuthenticationManager authenticationManager;
    @Autowired
    private JWTUtil jwtUtil;

    @GetMapping("/health")
    public String health(){
        return "healthy";
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody UserRequestDto userRequestDto){
                    return ResponseEntity.status(HttpStatus.CREATED)
                            .body(userService.registerUser(userRequestDto));
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@Valid @RequestBody AuthenticateUserDto authUser){
        try{
            authenticationManager
                    .authenticate(new UsernamePasswordAuthenticationToken(authUser.getEmail(),authUser.getPassword()));
        }
        catch (Exception e){
            System.out.println(Arrays.toString(e.getStackTrace()));
        }        return ResponseEntity.status(HttpStatus.OK)
                .body(jwtUtil.generateToken(authUser.getEmail()));
    }
}
