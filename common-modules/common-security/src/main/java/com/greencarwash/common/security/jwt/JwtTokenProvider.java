package com.greencarwash.common.security.jwt;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Slf4j
@Component
public class JwtTokenProvider {

    private final SecretKey signingKey;
    private final long tokenValidityInMilliseconds;
    private final long refreshTokenValidityInMilliseconds;

    public JwtTokenProvider(
            @Value("${jwt.secret:your-256-bit-secret-key-must-be-at-least-32-bytes-long-change-this-in-production}") String secret,
            @Value("${jwt.expiration-ms:86400000}") long tokenValidityInMilliseconds,
            @Value("${jwt.refresh-expiration-ms:604800000}") long refreshTokenValidityInMilliseconds) {
        
        byte[] keyBytes = secret.getBytes(StandardCharsets.UTF_8);
        if (keyBytes.length < 32) {
            byte[] paddedKey = new byte[32];
            System.arraycopy(keyBytes, 0, paddedKey, 0, keyBytes.length);
            this.signingKey = Keys.hmacShaKeyFor(paddedKey);
        } else {
            this.signingKey = Keys.hmacShaKeyFor(keyBytes);
        }
        this.tokenValidityInMilliseconds = tokenValidityInMilliseconds;
        this.refreshTokenValidityInMilliseconds = refreshTokenValidityInMilliseconds;
        log.info("JWT TOKEN PROVIDER INIT: secret.hashCode={}, secret.length={}, secret.prefix={}", 
                secret.hashCode(), secret.length(), secret.substring(0, Math.min(10, secret.length())));
    }

    public String createToken(String userId, String email, Set<String> roles) {
        Date now = new Date();
        Date validity = new Date(now.getTime() + tokenValidityInMilliseconds);

        return Jwts.builder()
                .subject(email)
                .claim("userId", userId)
                .claim("roles", roles)
                .issuedAt(now)
                .expiration(validity)
                .signWith(signingKey)
                .compact();
    }

    public String createRefreshToken(String userId, String email) {
        Date now = new Date();
        Date validity = new Date(now.getTime() + refreshTokenValidityInMilliseconds);

        return Jwts.builder()
                .subject(email)
                .claim("userId", userId)
                .claim("type", "REFRESH")
                .issuedAt(now)
                .expiration(validity)
                .signWith(signingKey)
                .compact();
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parser()
                    .verifyWith(signingKey)
                    .build()
                    .parseSignedClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            log.warn("Invalid JWT token: {}", e.getMessage());
            return false;
        }
    }

    public Claims getClaims(String token) {
        return Jwts.parser()
                .verifyWith(signingKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public String getEmail(String token) {
        return getClaims(token).getSubject();
    }

    public String getUserId(String token) {
        return getClaims(token).get("userId", String.class);
    }

    @SuppressWarnings("unchecked")
    public Set<String> getRoles(String token) {
        Object rolesObj = getClaims(token).get("roles");
        if (rolesObj instanceof List<?> list) {
            Set<String> set = new HashSet<>();
            for (Object item : list) {
                if (item != null) {
                    set.add(item.toString());
                }
            }
            return set;
        }
        return Set.of();
    }
}
