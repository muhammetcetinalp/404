package com.backend.delivery_backend.repository;

import com.backend.delivery_backend.model.RestaurantOwner;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RestaurantOwnerRepository extends JpaRepository<RestaurantOwner, String> {
    RestaurantOwner findByEmail(String email);
    RestaurantOwner findByRestaurantId(String restaurantId);
    RestaurantOwner findByName(String name);

    // New method to find restaurants by approval status
    List<RestaurantOwner> findByApprovedFalse();
    List<RestaurantOwner> findByApprovedTrue();
}