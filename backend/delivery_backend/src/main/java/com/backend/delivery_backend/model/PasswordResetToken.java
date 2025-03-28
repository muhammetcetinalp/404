package com.backend.delivery_backend.model;

import java.time.LocalDateTime;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import jakarta.persistence.*;


@Entity
@Table(name = "passwordresettoken")
public class PasswordResetToken {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private int id;

	private String token;
	private java.time.LocalDateTime expiryDateTime;

	@Column(nullable = false)
	private String userId;

	public int getId() { return id; }
	public void setId(int id) { this.id = id; }

	public String getToken() { return token; }
	public void setToken(String token) { this.token = token; }

	public java.time.LocalDateTime getExpiryDateTime() { return expiryDateTime; }
	public void setExpiryDateTime(java.time.LocalDateTime expiryDateTime) { this.expiryDateTime = expiryDateTime; }

	public String getUserId() { return userId; }
	public void setUserId(String userId) { this.userId = userId; }
}