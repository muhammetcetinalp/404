package com.backend.delivery_backend.controller;

import com.backend.delivery_backend.DTO.CourierRegistrationDTO;
import com.backend.delivery_backend.DTO.DeliveryRequestDTO;
import com.backend.delivery_backend.model.Courier;
import com.backend.delivery_backend.service.CourierService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

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

    @PatchMapping("/{courierId}/delivery-requests/{requestId}")
    public ResponseEntity<?> handleDeliveryRequest(
            @PathVariable Long courierId,
            @PathVariable Long requestId,
            @RequestBody DeliveryRequestDTO dto) {

        try {
            courierService.respondToDeliveryRequest(
                    courierId,
                    requestId,
                    dto.getStatus());

            return ResponseEntity.ok("Request updated as " + dto.getStatus());
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @PatchMapping("/{courierId}/status")
    public ResponseEntity<?> updateStatus(
            @PathVariable Long courierId,
            @RequestBody Map<String, String> requestBody) {
        try {
            String status = requestBody.get("status");
            courierService.updateCourierStatus(String.valueOf(courierId), status);
            return ResponseEntity.ok("Courier status updated to " + status);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }



}

