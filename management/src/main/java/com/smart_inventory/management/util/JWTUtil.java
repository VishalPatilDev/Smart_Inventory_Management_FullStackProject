package com.smart_inventory.management.util;

import com.smart_inventory.management.service.UserDetailsServiceImpl;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;

@Component
public class JWTUtil {



//    private final String secret = "THIS_IS_A_SECRET_KEY_FOR_JWT_UNDERSTANDING_IT_SHOULD_BE_OF_32_BYTES";
    @Value("${jwt.secret}")
    private String secret;
//    private final SecretKey key = Keys.hmacShaKeyFor(secret.getBytes());

    @Value("${jwt.expiration}")
    private long expiration;

    private SecretKey getKey() {
        return Keys.hmacShaKeyFor(secret.getBytes());
    }


    public String generateToken(String username,String role){
       return  Jwts.builder()
                .subject(username)
               .claim("role",role)
               .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis()+expiration))
                .signWith(getKey())
                .compact();
    }

    public String getUsername(String token){
        return getClaims(token)
                .getSubject();
    }

    private Claims getClaims(String token) {
        return Jwts.parser()
                .verifyWith(getKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }


    public boolean validateToken(String token, String username, UserDetails userDetails) {
        return username.equals(userDetails.getUsername()) && !isTokenExpired(token);

    }
    public boolean isTokenExpired(String token){
        return getClaims(token).getExpiration().before(new Date());
    }
}
