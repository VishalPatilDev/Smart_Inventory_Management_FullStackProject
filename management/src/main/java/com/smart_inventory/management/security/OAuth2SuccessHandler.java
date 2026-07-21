package com.smart_inventory.management.security;

import com.smart_inventory.management.model.User;
import com.smart_inventory.management.repository.UserRepository;
import com.smart_inventory.management.util.JWTUtil;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class OAuth2SuccessHandler implements AuthenticationSuccessHandler {
    @Autowired
    private JWTUtil jwtUtil;

    @Autowired
    private UserRepository userRepository;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication)
            throws IOException, ServletException {
        OAuth2User oauthUser =
                (OAuth2User) authentication.getPrincipal();
        String email = oauthUser.getAttribute("email");
        User user = userRepository
                .findByEmail(email)
                .orElseThrow();
        String jwt =
                jwtUtil.generateToken(
                        user.getEmail(),
                        user.getRole().name()
                );
        response.sendRedirect(
                "http://localhost:5173/oauth-success?token=" + jwt
        );

    }


}
