package com.greencarwash.auth.entity;

import jakarta.persistence.*;

import java.time.Instant;
@Entity @Table(name="password_reset_tokens") public class PasswordResetToken { @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id; @Column(nullable=false) private String email; @Column(nullable=false) private String otpHash; @Column(nullable=false) private Instant expiresAt; private boolean used; public Long getId(){return id;} public String getEmail(){return email;} public void setEmail(String v){email=v;} public String getOtpHash(){return otpHash;} public void setOtpHash(String v){otpHash=v;} public Instant getExpiresAt(){return expiresAt;} public void setExpiresAt(Instant v){expiresAt=v;} public boolean isUsed(){return used;} public void setUsed(boolean v){used=v;} }
