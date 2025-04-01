package com.backend.delivery_backend.model;
import jakarta.persistence.*;
import java.util.Set;
import java.util.HashSet;

@Entity
@Table(name = "customers")
public class Customer extends User {

    @Id
    @Column(name = "customer_id")
    private String customerId;
    @Column(nullable = false)
    private String address;
    @Column(name = "city")
    private String city;

    @Column(name = "district")
    private String district;

    @ManyToMany
    private Set<RestaurantOwner> favoriteRestaurants;

    @OneToMany(mappedBy = "customer")
    @com.fasterxml.jackson.annotation.JsonIgnore
    private Set<Order> orders;


    // Getter - Setter

    public Set<Order> getOrders() {
        return orders;
    }

    public void setOrders(Set<Order> orders) {
        this.orders = orders;
    }

    public Set<RestaurantOwner> getFavoriteRestaurants() {
        return favoriteRestaurants;
    }

    public void setFavoriteRestaurants(Set<RestaurantOwner> favoriteRestaurants) {
        this.favoriteRestaurants = favoriteRestaurants;
    }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getDistrict() { return district; }
    public void setDistrict(String district) { this.district = district; }
    @Override
    public String getId() {
        return this.customerId;
    }


    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public String getCustomerId() {
        return customerId;
    }

    public void setCustomerId(String customerId) {
        this.customerId = customerId;
    }
}
