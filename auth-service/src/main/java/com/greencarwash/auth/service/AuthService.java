package com.greencarwash.auth.service;

import com.greencarwash.auth.entity.PasswordResetToken;

import com.greencarwash.auth.entity.UserAccount;

import com.greencarwash.auth.repository.PasswordResetTokenRepository;

import com.greencarwash.auth.repository.UserAccountRepository;

import io.jsonwebtoken.Jwts;

import io.jsonwebtoken.security.Keys;

import java.nio.charset.StandardCharsets;

import java.security.SecureRandom;

import java.time.Instant;

import java.util.Date;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import org.springframework.stereotype.Service;

import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private static final long TOKEN_VALIDITY_MILLIS = 3_600_000L;
    private static final long OTP_VALIDITY_SECONDS = 600L;
    private static final String DEFAULT_ROLE = "CUSTOMER";
    private static final String JWT_SECRET = "GreenCarWashJwtSecretKeyForDevelopmentOnlyChangeMe123456789";

    private final UserAccountRepository users;
    private final PasswordResetTokenRepository tokens;
    private final BCryptPasswordEncoder encoder;
    private final SecureRandom random;

    public AuthService(UserAccountRepository users, PasswordResetTokenRepository tokens,
            BCryptPasswordEncoder encoder) {
        this.users = users;
        this.tokens = tokens;
        this.encoder = encoder;
        this.random = new SecureRandom();
    }

    @Transactional
    public UserAccount register(String email, String password, String role) {
        if (users.existsByEmail(email)) {
            throw new IllegalArgumentException("Email already registered");
        }

        UserAccount user = new UserAccount();
        user.setEmail(email);
        user.setPasswordHash(encoder.encode(password));
        user.setRole(role == null || role.isBlank() ? DEFAULT_ROLE : role);
        return users.save(user);
    }

    public String login(String email, String password) {
        UserAccount user = users.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Invalid credentials"));

        if (!user.isActive() || !encoder.matches(password, user.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid credentials");
        }

        Date now = new Date();
        Date expiry = new Date(now.getTime() + TOKEN_VALIDITY_MILLIS);

        return Jwts.builder()
                .subject(user.getEmail())
                .claim("role", user.getRole())
                .issuedAt(now)
                .expiration(expiry)
                .signWith(Keys.hmacShaKeyFor(JWT_SECRET.getBytes(StandardCharsets.UTF_8)))
                .compact();
    }

    @Transactional
    public String forgotPassword(String email) {
        users.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Account not found"));

        String otp = String.format("%06d", random.nextInt(1_000_000));
        PasswordResetToken token = tokens.findTopByEmailAndUsedFalseOrderByIdDesc(email)
                .orElseGet(PasswordResetToken::new);

        token.setEmail(email);
        token.setOtpHash(encoder.encode(otp));
        token.setExpiresAt(Instant.now().plusSeconds(OTP_VALIDITY_SECONDS));
        token.setUsed(false);
        tokens.save(token);

        return otp;
    }

    public boolean verifyOtp(String email, String otp) {
        PasswordResetToken token = tokens.findTopByEmailAndUsedFalseOrderByIdDesc(email)
                .orElseThrow(() -> new IllegalArgumentException("Invalid verification code"));

        if (token.getExpiresAt().isBefore(Instant.now())
                || !encoder.matches(otp, token.getOtpHash())) {
            throw new IllegalArgumentException("Invalid verification code");
        }

        return true;
    }

    @Transactional
    public void resetPassword(String email, String otp, String newPassword) {
        verifyOtp(email, otp);

        PasswordResetToken token = tokens.findTopByEmailAndUsedFalseOrderByIdDesc(email)
                .orElseThrow(() -> new IllegalArgumentException("Invalid verification code"));
        token.setUsed(true);
        tokens.save(token);

        UserAccount user = users.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Account not found"));
        user.setPasswordHash(encoder.encode(newPassword));
        users.save(user);
    }

    public UserAccount me(String email) {
        return users.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Account not found"));
    }
}
