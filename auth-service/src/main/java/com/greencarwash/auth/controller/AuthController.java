package com.greencarwash.auth.controller;

import com.greencarwash.auth.entity.UserAccount;

import com.greencarwash.auth.service.AuthService;

import jakarta.validation.Valid;

import jakarta.validation.constraints.Email;

import jakarta.validation.constraints.NotBlank;

import java.util.Map;

import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.GetMapping;

import org.springframework.web.bind.annotation.PostMapping;

import org.springframework.web.bind.annotation.RequestBody;

import org.springframework.web.bind.annotation.RequestHeader;

import org.springframework.web.bind.annotation.RequestMapping;

import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService service;

    public AuthController(AuthService service) {
        this.service = service;
    }

    @PostMapping("/register")
    public ResponseEntity<UserAccount> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(service.register(request.email(), request.password(), request.role()));
    }

    @PostMapping("/verify-email")
    public Map<String, String> verifyEmail(@RequestBody Map<String, String> request) {
        return Map.of(
                "message", "Email verification accepted",
                "email", request.getOrDefault("email", ""));
    }

    @PostMapping("/resend-verification")
    public Map<String, String> resendVerification(@RequestBody Map<String, String> request) {
        return Map.of("message", "Verification code sent");
    }

    @PostMapping("/login")
    public Map<String, String> login(@Valid @RequestBody LoginRequest request) {
        return Map.of(
                "accessToken", service.login(request.email(), request.password()),
                "tokenType", "Bearer");
    }

    @PostMapping("/refresh")
    public Map<String, String> refresh(@RequestBody Map<String, String> request) {
        return Map.of("accessToken", request.getOrDefault("refreshToken", ""));
    }

    @PostMapping("/logout")
    public Map<String, String> logout() {
        return Map.of("message", "Logged out successfully");
    }

    @PostMapping("/forgot-password")
    public Map<String, String> forgotPassword(@Valid @RequestBody EmailRequest request) {
        return Map.of(
                "message", "Verification code generated",
                "verificationCode", service.forgotPassword(request.email()));
    }

    @PostMapping("/verify-reset-otp")
    public Map<String, Object> verifyResetOtp(@Valid @RequestBody OtpRequest request) {
        return Map.of("valid", service.verifyOtp(request.email(), request.otp()));
    }

    @PostMapping("/reset-password")
    public Map<String, String> resetPassword(@Valid @RequestBody ResetRequest request) {
        service.resetPassword(request.email(), request.otp(), request.newPassword());
        return Map.of("message", "Password reset successful");
    }

    @GetMapping("/me")
    public UserAccount me(@RequestHeader("X-User-Email") String email) {
        return service.me(email);
    }

    @GetMapping("/roles")
    public Map<String, Object> roles() {
        return Map.of("roles", new String[] { "CUSTOMER", "WASHER", "ADMIN" });
    }

    public record RegisterRequest(@Email @NotBlank String email, @NotBlank String password, String role) {
    }

    public record LoginRequest(@Email @NotBlank String email, @NotBlank String password) {
    }

    public record EmailRequest(@Email @NotBlank String email) {
    }

    public record OtpRequest(@Email @NotBlank String email, @NotBlank String otp) {
    }

    public record ResetRequest(@Email @NotBlank String email, @NotBlank String otp,
            @NotBlank String newPassword) {
    }
}
