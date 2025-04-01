package com.backend.delivery_backend.model;

import jakarta.persistence.*;
import java.util.*;

@Entity
public class Cart {

    @Id
    private String id;

    @OneToOne
    private Customer customer;

    @ElementCollection
    @CollectionTable(name = "cart_items", joinColumns = @JoinColumn(name = "cart_id"))
    @MapKeyJoinColumn(name = "menu_item_id")
    @Column(name = "quantity")
    private Map<MenuItem, Integer> items = new HashMap<>();

    // Getters and setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public Customer getCustomer() {
        return customer;
    }

    public void setCustomer(Customer customer) {
        this.customer = customer;
    }

    public Map<MenuItem, Integer> getItems() {
        return items;
    }

    public void setItems(Map<MenuItem, Integer> items) {
        this.items = items;
    }

    public void addItem(MenuItem item, int quantity) {
        items.merge(item, quantity, Integer::sum);
    }
}
