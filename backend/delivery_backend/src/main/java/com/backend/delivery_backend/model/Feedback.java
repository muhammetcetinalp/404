package com.backend.delivery_backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
public class Feedback {

    @Id
    private String id;

    @ManyToOne
    @JoinColumn(name = "order_id")
    private Order order;

    @ManyToOne
    @JoinColumn(name = "restaurant_id")
    private RestaurantOwner restaurant;

    @ManyToOne
    @JoinColumn(name = "courier_id")
    private Courier courier;

    @ManyToOne
    @JoinColumn(name = "customer_id")
    private Customer customer;

    private int restaurantRating;
    private String restaurantReview;

    private int courierRating;
    private String courierReview;

    private LocalDateTime createdAt;

    // Getters and Setters

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public Order getOrder() {
        return order;
    }

    public void setOrder(Order order) {
        this.order = order;
    }

    public RestaurantOwner getRestaurant() {
        return restaurant;
    }

    public void setRestaurant(RestaurantOwner restaurant) {
        this.restaurant = restaurant;
    }

    public Courier getCourier() {
        return courier;
    }

    public void setCourier(Courier courier) {
        this.courier = courier;
    }

    public Customer getCustomer() {
        return customer;
    }

    public void setCustomer(Customer customer) {
        this.customer = customer;
    }

    public int getRestaurantRating() {
        return restaurantRating;
    }

    public void setRestaurantRating(int restaurantRating) {
        this.restaurantRating = restaurantRating;
    }

    public String getRestaurantReview() {
        return restaurantReview;
    }

    public void setRestaurantReview(String restaurantReview) {
        this.restaurantReview = restaurantReview;
    }

    public int getCourierRating() {
        return courierRating;
    }

    public void setCourierRating(int courierRating) {
        this.courierRating = courierRating;
    }

    public String getCourierReview() {
        return courierReview;
    }

    public void setCourierReview(String courierReview) {
        this.courierReview = courierReview;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
