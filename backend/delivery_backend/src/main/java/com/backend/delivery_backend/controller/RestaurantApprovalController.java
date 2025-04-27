package com.backend.delivery_backend.controller;

import com.backend.delivery_backend.model.RestaurantOwner;
import com.backend.delivery_backend.repository.RestaurantOwnerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class RestaurantApprovalController {

    @Autowired
    private RestaurantOwnerRepository restaurantOwnerRepository;

    // Get all pending restaurant approvals
    @GetMapping("/pending-restaurants")
    public ResponseEntity<?> getPendingRestaurants() {
        try {
            // Find all restaurants with approved status as false
            Iterable<RestaurantOwner> pendingRestaurants = restaurantOwnerRepository.findByApprovedFalse();
            return ResponseEntity.ok(pendingRestaurants);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching pending restaurants: " + e.getMessage());
        }
    }

    // Approve a restaurant
    @PostMapping("/approve-restaurant/{restaurantId}")
    public ResponseEntity<?> approveRestaurant(@PathVariable String restaurantId) {
        try {
            Optional<RestaurantOwner> restaurantOpt = restaurantOwnerRepository.findById(restaurantId);

            if (restaurantOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("Restaurant not found with ID: " + restaurantId);
            }

            RestaurantOwner restaurant = restaurantOpt.get();
            restaurant.setApproved(true);
            restaurantOwnerRepository.save(restaurant);

            return ResponseEntity.ok("Restaurant approved successfully");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error approving restaurant: " + e.getMessage());
        }
    }

    // Reject a restaurant
    @PostMapping("/reject-restaurant/{restaurantId}")
    public ResponseEntity<?> rejectRestaurant(@PathVariable String restaurantId) {
        try {
            Optional<RestaurantOwner> restaurantOpt = restaurantOwnerRepository.findById(restaurantId);

            if (restaurantOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("Restaurant not found with ID: " + restaurantId);
            }

            // You could either delete the restaurant or mark it as rejected
            // Here we're deleting it
            restaurantOwnerRepository.deleteById(restaurantId);

            return ResponseEntity.ok("Restaurant rejected and removed from the system");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error rejecting restaurant: " + e.getMessage());
        }
    }
}