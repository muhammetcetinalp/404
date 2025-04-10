package com.backend.delivery_backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.Map;

@Entity
@Table(name = "orders")
public class Order {

    @Id
    private String orderId;

    @ManyToOne
    @JoinColumn(name = "customer_id")
    private Customer customer;

    private String deliveryAddress;
    private String paymentMethod;
    private String orderStatus;
    private LocalDateTime orderDate;
    private double totalAmount;

    // In Order.java - Add this field
    @ManyToOne
    @JoinColumn(name = "restaurant_id")
    private RestaurantOwner restaurant;


    @Enumerated(EnumType.STRING)
    private DeliveryType deliveryType;

    @ElementCollection
    @CollectionTable(name = "order_items", joinColumns = @JoinColumn(name = "order_id"))
    @MapKeyJoinColumn(name = "menu_item_id")
    @Column(name = "quantity")
    private Map<MenuItem, Integer> items;

    @OneToOne(mappedBy = "order", cascade = CascadeType.ALL)
    private Payment payment;

    private double tipAmount = 0.0;

    public String getOrderId() {
        return orderId;
    }
    public void setOrderId(String orderId) {
        this.orderId = orderId;
    }

    public Customer getCustomer() {
        return customer;
    }
    public void setCustomer(Customer customer) {
        this.customer = customer;
    }

    public String getDeliveryAddress() {
        return deliveryAddress;
    }
    public void setDeliveryAddress(String deliveryAddress) {
        this.deliveryAddress = deliveryAddress;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }
    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public String getOrderStatus() {
        return orderStatus;
    }
    public void setOrderStatus(String orderStatus) {
        this.orderStatus = orderStatus;
    }

    public LocalDateTime getOrderDate() {
        return orderDate;
    }
    public void setOrderDate(LocalDateTime orderDate) {
        this.orderDate = orderDate;
    }

    public double getTotalAmount() {
        return totalAmount;
    }
    public void setTotalAmount(double totalAmount) {
        this.totalAmount = totalAmount;
    }

    public Map<MenuItem, Integer> getItems() {
        return items;
    }
    public void setItems(Map<MenuItem, Integer> items) {
        this.items = items;
    }

    public DeliveryType getDeliveryType() {
        return deliveryType;
    }
    public void setDeliveryType(DeliveryType deliveryType) {
        this.deliveryType = deliveryType;
    }

    public Payment getPayment() {
        return payment;
    }
    public void setPayment(Payment payment) {
        this.payment = payment;
    }

    public double getTipAmount() {
        return tipAmount;
    }
    public void setTipAmount(double tipAmount) {
        this.tipAmount = tipAmount;
    }

    public RestaurantOwner getRestaurant() {
        return restaurant;
    }

    public void setRestaurant(RestaurantOwner restaurant) {
        this.restaurant = restaurant;
    }
}