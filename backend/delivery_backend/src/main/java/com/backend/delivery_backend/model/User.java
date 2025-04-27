package com.backend.delivery_backend.model;

import jakarta.persistence.*;

@MappedSuperclass
public abstract class User {

	@Column(nullable = false)
	private String name;

	@Column(nullable = false, unique = true)
	private String email;

	@Column(nullable = false)
	private String password;

	@Column(nullable = false)
	private String phone;

	@Column(nullable = false)
	private String role;

	// Yeni eklenen alan - kullanıcı durumu
	@Column(name = "account_status")
	private String accountStatus = "ACTIVE"; // Varsayılan olarak ACTIVE

	public abstract String getId();

	// Getter/setter
	public String getName() { return name; }
	public void setName(String name) { this.name = name; }

	public String getEmail() { return email; }
	public void setEmail(String email) { this.email = email; }

	public String getPassword() { return password; }
	public void setPassword(String password) { this.password = password; }

	public String getPhone() { return phone; }
	public void setPhone(String phone) { this.phone = phone; }

	public String getRole() { return role; }
	public void setRole(String role) { this.role = role; }

	// Yeni getter ve setter
	public String getAccountStatus() { return accountStatus; }
	public void setAccountStatus(String accountStatus) { this.accountStatus = accountStatus; }
}