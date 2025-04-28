package com.backend.delivery_backend.controller;

import com.backend.delivery_backend.DTO.DeliveryRequestDTO;
import com.backend.delivery_backend.service.CourierService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.Authentication;
import com.backend.delivery_backend.model.Courier;
import com.backend.delivery_backend.repository.CourierRepository;
import com.backend.delivery_backend.model.Order;
import com.backend.delivery_backend.repository.OrderRepository;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;

@RestController
@RequestMapping("/api/couriers")
public class CourierController {

    private final CourierService courierService;
    @Autowired
    private CourierRepository courierRepository;

    @Autowired
    private OrderRepository orderRepository;

    public CourierController(CourierService courierService) {
        this.courierService = courierService;
    }

    @PostMapping("/{courierId}/assign-restaurant/{restaurantId}")
    public ResponseEntity<?> assignRestaurant(
            @PathVariable String courierId,
            @PathVariable Long restaurantId) {
        try {
            courierService.assignRestaurantToCourier(courierId, restaurantId);
            return ResponseEntity.ok("Courier " + courierId + " is now assigned to Restaurant " + restaurantId);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @PostMapping("/{courierId}/assign-restaurant-by-name")
    public ResponseEntity<?> assignRestaurantByName(
            @PathVariable String courierId,
            @RequestParam String name) {
        try {
            courierService.assignRestaurantToCourierByName(courierId, name);
            return ResponseEntity.ok("Courier assigned to restaurant with name: " + name);
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

    @GetMapping("/active")
    public ResponseEntity<?> getActiveOrdersForCourier(Authentication auth) {
        String email = auth.getName();
        Courier courier = courierRepository.findByEmail(email);

        if (courier == null || courier.getRestaurantOwner() == null) {
            return ResponseEntity.badRequest().body("Courier not assigned to any restaurant.");
        }

        String restaurantId = courier.getRestaurantOwner().getRestaurantId();

        List<Order> activeOrders = orderRepository.findByRestaurantIdAndOrderStatus(restaurantId, "PENDING");

        return ResponseEntity.ok(activeOrders);
    }



}
