package com.greencarwash.auth.repository;

import com.greencarwash.auth.entity.PasswordResetToken;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken,Long>{ Optional<PasswordResetToken> findTopByEmailAndUsedFalseOrderByIdDesc(String email); }
