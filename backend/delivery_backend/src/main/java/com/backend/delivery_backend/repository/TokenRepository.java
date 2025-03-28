package com.backend.delivery_backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.backend.delivery_backend.model.PasswordResetToken;
import com.backend.delivery_backend.model.User;


public interface TokenRepository extends JpaRepository<PasswordResetToken, Integer> {
	PasswordResetToken findByToken(String token);
	PasswordResetToken findByUserId(String userId);
}
