package com.backend.delivery_backend.repository;

import com.backend.delivery_backend.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrderRepository extends JpaRepository<Order, String> {

    List<Order> findByRestaurantId(String restaurantId);
    // OrderRepository.java'ya ekle
    List<Order> findByRestaurantIdAndOrderStatus(String restaurantId, String orderStatus);
    List<Order> findByCourierId(String courierId);
    Long countByCourierIdAndRestaurantId(String courierId, String restaurantId);
}