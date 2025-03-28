package com.backend.delivery_backend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "admins")
public class Admin extends User {
    @Id
    private String adminId;

    public String getAdminId() {
        return adminId;
    }

    public void setAdminId(String adminId) {
        this.adminId = adminId;
    }

    @Override
    public String getId() {
        return this.adminId;
    }
}
