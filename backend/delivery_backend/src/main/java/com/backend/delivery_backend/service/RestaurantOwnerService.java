package com.backend.delivery_backend.service;

import com.backend.delivery_backend.model.RestaurantOwner;
import com.backend.delivery_backend.repository.RestaurantOwnerRepository;
import org.springframework.stereotype.Service;

@Service
public class RestaurantOwnerService {

    private final RestaurantOwnerRepository restaurantOwnerRepository;

    public RestaurantOwnerService(RestaurantOwnerRepository restaurantOwnerRepository) {
        this.restaurantOwnerRepository = restaurantOwnerRepository;
    }

    public boolean toggleRestaurantStatus(String restaurantId) {
        RestaurantOwner restaurantOwner = restaurantOwnerRepository.findById(restaurantId)
                .orElseThrow(() -> new RuntimeException("Restaurant not found"));

        boolean newStatus = !restaurantOwner.isOpen(); // toggle işlemi
        restaurantOwner.setOpen(newStatus);
        restaurantOwnerRepository.save(restaurantOwner);

        System.out.println("[INFO] Restaurant " + restaurantId + " is now " + (newStatus ? "OPEN" : "CLOSED"));

        return newStatus;
    }
}

