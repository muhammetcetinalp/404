package com.backend.delivery_backend.repository;

import com.backend.delivery_backend.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrderRepository extends JpaRepository<Order, String> {

    // Mevcut metotlarınız...
    List<Order> findByRestaurantId(String restaurantId); // findByRestaurantRestaurantId olarak da adlandırılabilir
    List<Order> findByRestaurantRestaurantId(String restaurantId); // Daha spesifik ve doğru adlandırma
    List<Order> findByRestaurantIdAndOrderStatus(String restaurantId, String orderStatus);
    List<Order> findByCourierId(String courierId);
    Long countByCourierIdAndRestaurantId(String courierId, String restaurantId);
    Order findByOrderId(String orderId);

    // BU METODU EKLEYİN VEYA KONTROL EDİN
    List<Order> findByCustomerCustomerId(String customerId);
    // VEYA List<Order> findByCustomer_CustomerId(String customerId); Spring Data JPA konvansiyonu

    List<Order> findByCustomerCustomerIdAndOrderStatusNotIn(String customerId, List<String> statuses);
    List<Order> findByRestaurantRestaurantIdAndOrderStatusNotIn(String restaurantId, List<String> statuses);
    List<Order> findByCourierCourierIdAndOrderStatusNotIn(String courierId, List<String> statuses);
    List<Order> findByRestaurantRestaurantIdAndOrderStatusIn(String restaurantId, List<String> statuses);
}