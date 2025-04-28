package com.backend.delivery_backend.model;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "menu_item")
@Getter
@Setter
public class MenuItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Getter
    @Setter(AccessLevel.NONE) // id should not have a setter
    private Long id;

    @Column(nullable = false)
    private String name;

    private String description;

    @Column(nullable = false)
    private double price;

    private boolean available = true;

    @ManyToOne
    @JoinColumn(name = "restaurant_id")
    private RestaurantOwner restaurant;
}