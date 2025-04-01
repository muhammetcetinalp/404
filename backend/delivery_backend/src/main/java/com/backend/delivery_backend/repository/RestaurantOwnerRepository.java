package com.backend.delivery_backend.repository;
import com.backend.delivery_backend.model.RestaurantOwner;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RestaurantOwnerRepository extends JpaRepository<RestaurantOwner, String> {
    RestaurantOwner findByEmail(String email);
    RestaurantOwner findByRestaurantId(String restaurantId);
    RestaurantOwner findByName(String name);

}
