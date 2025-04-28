package com.backend.delivery_backend.repository;

import com.backend.delivery_backend.model.CourierRestaurantRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CourierRestaurantRequestRepository extends JpaRepository<CourierRestaurantRequest, Long> {
    List<CourierRestaurantRequest> findByRestaurantRestaurantId(String restaurantId);
    List<CourierRestaurantRequest> findByCourierCourierId(String courierId);
    List<CourierRestaurantRequest> findByCourierIdAndRestaurantId(String courierId, String restaurantId);
}