package com.backend.delivery_backend.controller;

import com.backend.delivery_backend.DTO.CourierRegistrationDTO;
import com.backend.delivery_backend.model.Courier;
import com.backend.delivery_backend.service.CourierService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/couriers")
public class CourierController {

    private final CourierService courierService;

    public CourierController(CourierService courierService) {
        this.courierService = courierService;
    }

    @PostMapping("/{courierId}/assign-restaurant/{restaurantId}")
    public ResponseEntity<?> assignRestaurant(
            @PathVariable Long courierId,
            @PathVariable Long restaurantId) {
        try {
            courierService.assignRestaurantToCourier(courierId, restaurantId);
            return ResponseEntity.ok("Courier " + courierId + " is now assigned to Restaurant " + restaurantId);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

}

