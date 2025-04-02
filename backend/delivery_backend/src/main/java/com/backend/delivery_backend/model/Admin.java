package com.backend.delivery_backend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "admins")
public class Admin extends User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long adminId;

    public Long getAdminId() {
        return adminId;
    }

    public void setAdminId(Long adminId) {
        this.adminId = adminId;
    }

    @Override
    public String getId() {
        return String.valueOf(this.adminId); // String döndürmeye devam ediyorsan böyle dönüştür
    }
}
