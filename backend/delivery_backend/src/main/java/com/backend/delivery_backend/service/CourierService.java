package com.backend.delivery_backend.service;

import com.backend.delivery_backend.DTO.CourierRegistrationDTO;
import com.backend.delivery_backend.model.Courier;
import com.backend.delivery_backend.model.RestaurantOwner;
import com.backend.delivery_backend.repository.CourierRepository;
import com.backend.delivery_backend.repository.RestaurantOwnerRepository;
import org.springframework.stereotype.Service;

@Service
public class CourierService {

    private final CourierRepository courierRepository;
    private final RestaurantOwnerRepository restaurantOwnerRepository;

    public CourierService(CourierRepository courierRepository,
                          RestaurantOwnerRepository restaurantOwnerRepository) {
        this.courierRepository = courierRepository;
        this.restaurantOwnerRepository = restaurantOwnerRepository;
    }

    public void assignRestaurantToCourier(Long courierId, Long restaurantId) {

        Courier courier = courierRepository.findById(String.valueOf(courierId))
                .orElseThrow(() -> new RuntimeException("Courier not found"));

        RestaurantOwner restaurant = restaurantOwnerRepository.findById(String.valueOf(restaurantId))
                .orElseThrow(() -> new RuntimeException("Restaurant owner not found"));

        courier.setRestaurantOwner(restaurant);
        courierRepository.save(courier);
    }
}

