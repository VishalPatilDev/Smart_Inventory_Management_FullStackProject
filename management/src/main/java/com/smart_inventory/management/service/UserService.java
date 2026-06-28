package com.smart_inventory.management.service;

import com.smart_inventory.management.custom_exceptions.EmailAlreadyExistsException;
import com.smart_inventory.management.dto.UserRequestDto;
import com.smart_inventory.management.dto.UserResponseDto;
import com.smart_inventory.management.events.UserRegisterEvent;
//import com.smart_inventory.management.listeners.EmailEventListener;
import com.smart_inventory.management.model.User;
import com.smart_inventory.management.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private ApplicationEventPublisher applicationEventPublisher;



    @Autowired
    private PasswordEncoder passwordEncoder;

    public UserResponseDto registerUser(UserRequestDto userRequestDto) {
        if(userRepository.existsByEmail(userRequestDto.getEmail())){
            throw new EmailAlreadyExistsException(userRequestDto.getEmail());
        }
        User user = User.builder()
                .name(userRequestDto.getName())
                .password(passwordEncoder.encode(userRequestDto.getPassword()))
                .email(userRequestDto.getEmail())
                .role(userRequestDto.getRole()).build();
        userRepository.save(user);
//        applicationEventPublisher.publishEvent(new UserRegisterEvent(user));
        return UserResponseDto.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())

                .role(user.getRole())
                .build();
    }


    public List<UserResponseDto> fetchUsers() {
        return userRepository.findAll().stream().map(u->UserResponseDto.builder().id(u.getId()).name(u.getName()).email(u.getEmail()).role(u.getRole()).build()).collect(Collectors.toList());
    }

    public UserResponseDto getUserById(Long id) {
         User user = userRepository.findById(id).orElseThrow(()->new UsernameNotFoundException("User not found !"));
         return UserResponseDto.builder().name(user.getName()).id(user.getId()).email(user.getEmail()).role(user.getRole()).build();
    }

    public UserResponseDto deleteById(Long id) {
        User user = userRepository.findById(id).orElseThrow(()->new UsernameNotFoundException("User not found !"));
        userRepository.deleteById(user.getId());
        return UserResponseDto.builder().name(user.getName()).id(user.getId()).email(user.getEmail()).role(user.getRole()).build();

    }

    public UserResponseDto updateById(UserRequestDto userRequestDto, Long id) {
        User user = userRepository.findById(id).orElseThrow(()->new UsernameNotFoundException("User not found !"));
        user.setEmail(userRequestDto.getEmail());
        user.setName(userRequestDto.getName());
        user.setPassword(passwordEncoder.encode(userRequestDto.getPassword()));
        user.setRole(userRequestDto.getRole());
        userRepository.save(user);
        return UserResponseDto.builder().name(user.getName()).role(user.getRole()).email(user.getEmail()).id(user.getId()).build();
    }
}
