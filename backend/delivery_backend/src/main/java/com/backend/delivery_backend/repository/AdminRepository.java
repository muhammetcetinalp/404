package com.backend.delivery_backend.repository;

import com.backend.delivery_backend.model.Admin;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AdminRepository extends JpaRepository<Admin, String> {
    Admin findByEmail(String email);
    Admin findByAdminId(String adminId);
}
