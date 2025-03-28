package com.backend.delivery_backend.model;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "couriers")
public class Courier extends User {
    @Id
    private String courierId;

    public String getCourierId() {
        return courierId;
    }

    public void setCourierId(String courierId) {
        this.courierId = courierId;
    }
    @Override
    public String getId() {
        return this.courierId;
    }

}
