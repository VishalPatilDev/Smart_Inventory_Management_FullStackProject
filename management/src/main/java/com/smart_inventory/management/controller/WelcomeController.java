package com.smart_inventory.management.controller;

import com.smart_inventory.management.dto.AuthenticateUserDto;
import com.smart_inventory.management.dto.UserRequestDto;
import com.smart_inventory.management.dto.UserResponseDto;
import com.smart_inventory.management.model.User;
import com.smart_inventory.management.service.UserService;
import com.smart_inventory.management.util.JWTUtil;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
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
    @GetMapping("/auth/me")
    public ResponseEntity<UserResponseDto> me(Authentication authentication) {

        User user = userService.findByEmail(authentication.getName());

        return ResponseEntity.ok(
                new UserResponseDto(
                        user.getId(),
                        user.getName(),
                        user.getEmail(),
                        user.getRole())
        );
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@Valid @RequestBody AuthenticateUserDto authUser){
        try{
            authenticationManager
                    .authenticate(new UsernamePasswordAuthenticationToken(authUser.getEmail(),authUser.getPassword()));
        }
        catch (Exception e){
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid email or password");
        }

        // Fetch the actual user entity so we know their role
        User user = userService.findByEmail(authUser.getEmail());
        // Pass BOTH email and role into the token
        String token = jwtUtil.generateToken(authUser.getEmail(), user.getRole().name());
        return ResponseEntity.status(HttpStatus.OK).body(token);
    }
}
