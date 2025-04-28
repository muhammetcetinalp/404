package com.backend.delivery_backend.model;

import com.backend.delivery_backend.ENUM.CourierStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "couriers")
public class Courier extends User {
    @Id
    private String courierId;

    @ManyToOne
    @JoinColumn(name = "restaurantId")
    private RestaurantOwner restaurantOwner;

    @Enumerated(EnumType.STRING)
    private CourierStatus status = CourierStatus.UNAVAILABLE; // default olarak unavailable


    public void setCourierId(String courierId) {
        this.courierId = courierId;
    }
    @Override
    public String getId() {
        return this.courierId;
    }

}