package com.backend.delivery_backend.repository;

import com.backend.delivery_backend.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrderRepository extends JpaRepository<Order, String> {

    List<Order> findByRestaurantId(String restaurantId);
    List<Order> findByRestaurantIdAndOrderStatus(String restaurantId, String orderStatus);
    List<Order> findByCourierId(String courierId);
    Long countByCourierIdAndRestaurantId(String courierId, String restaurantId);
    Order findByOrderId(String orderId); // Ensure this line exists if you don't use findById
    List<Order> findByCustomerId(String customerId);

    // New methods for checking active orders
    List<Order> findByCustomerCustomerIdAndOrderStatusNotIn(String customerId, List<String> statuses);
    List<Order> findByRestaurantRestaurantIdAndOrderStatusNotIn(String restaurantId, List<String> statuses);
    List<Order> findByCourierCourierIdAndOrderStatusNotIn(String courierId, List<String> statuses);
}