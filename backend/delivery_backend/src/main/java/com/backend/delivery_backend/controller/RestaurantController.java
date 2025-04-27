package com.backend.delivery_backend.controller;

import com.backend.delivery_backend.DTO.MenuItemDTO;
import com.backend.delivery_backend.DTO.RestaurantStatusDTO;
import com.backend.delivery_backend.model.MenuItem;
import com.backend.delivery_backend.model.RestaurantOwner;
import com.backend.delivery_backend.repository.RestaurantOwnerRepository;
import com.backend.delivery_backend.service.RestaurantOwnerService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.HashMap;

@RestController
@RequestMapping("/api/restaurants")
public class RestaurantController {

    private final RestaurantOwnerService restaurantOwnerService;
    private final RestaurantOwnerRepository restaurantOwnerRepository;

    public RestaurantController(RestaurantOwnerService restaurantOwnerService,RestaurantOwnerRepository restaurantOwnerRepository ) {
        this.restaurantOwnerService = restaurantOwnerService;
        this.restaurantOwnerRepository = restaurantOwnerRepository;
    }

    @GetMapping("/{id}/menu")
    public ResponseEntity<?> getMenu(@PathVariable String id) {
        // First check if the restaurant is approved
        Optional<RestaurantOwner> restaurant = restaurantOwnerRepository.findById(id);
        if (restaurant.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Restaurant not found");
        }

        // If restaurant is not approved, return 403 Forbidden
        if (!restaurant.get().isApproved()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Restaurant is pending approval");
        }

        List<MenuItem> items = restaurantOwnerService.getMenuItemsByRestaurant(id);
        return ResponseEntity.ok(items);
    }

    @PatchMapping("/{id}/toggle-status")
    @PreAuthorize("hasRole('RESTAURANT_OWNER')")
    public ResponseEntity<?> toggleRestaurantStatus(@PathVariable String id) {
        Optional<RestaurantOwner> optional = restaurantOwnerRepository.findById(id);
        if (optional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Restaurant not found");
        }

        RestaurantOwner restaurant = optional.get();
        boolean currentStatus = restaurant.isOpen();
        restaurant.setOpen(!currentStatus); // durumu tersine çevir
        restaurantOwnerRepository.save(restaurant);

        return ResponseEntity.ok(new RestaurantStatusDTO(restaurant.isOpen()));
    }

    @PostMapping("/{id}/menu")
    public ResponseEntity<?> addMenuItem(@PathVariable String id,
                                         @RequestBody MenuItemDTO dto) {
        try {
            MenuItem item = restaurantOwnerService.addMenuItem(id, dto);
            return ResponseEntity.ok("Menu item added with ID: " + item.getId());
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @PutMapping("/{restaurantId}/menu/{itemId}")
    public ResponseEntity<?> updateMenuItem(@PathVariable String restaurantId,
                                            @PathVariable Long itemId,
                                            @RequestBody MenuItemDTO dto) {
        try {
            MenuItem updatedItem = restaurantOwnerService.updateMenuItem(restaurantId, itemId, dto);
            return ResponseEntity.ok("Menu item updated: " + updatedItem.getName());
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @DeleteMapping("/{restaurantId}/menu/{itemId}")
    public ResponseEntity<?> deleteMenuItem(@PathVariable String restaurantId,
                                            @PathVariable Long itemId) {
        try {
            restaurantOwnerService.deleteMenuItem(restaurantId, itemId);
            return ResponseEntity.ok("Menu item deleted.");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getRestaurantDetails(@PathVariable String id) {
        Optional<RestaurantOwner> restaurant = restaurantOwnerRepository.findById(id);
        if (restaurant.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Restaurant not found");
        }

        // If restaurant is not approved, return 403 Forbidden
        if (!restaurant.get().isApproved()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Restaurant is pending approval");
        }

        boolean isOpen = restaurant.get().isOpen();  // açık mı?
        return ResponseEntity.ok(new RestaurantStatusDTO(isOpen));
    }
}