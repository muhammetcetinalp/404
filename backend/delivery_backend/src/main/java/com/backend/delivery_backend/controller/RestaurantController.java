package com.backend.delivery_backend.controller;

import com.backend.delivery_backend.DTO.MenuItemDTO;
import com.backend.delivery_backend.model.MenuItem;
import com.backend.delivery_backend.service.RestaurantOwnerService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/restaurants")
public class RestaurantController {

    private final RestaurantOwnerService restaurantOwnerService;

    public RestaurantController(RestaurantOwnerService restaurantOwnerService) {
        this.restaurantOwnerService = restaurantOwnerService;
    }

    @PatchMapping("/{id}/toggle-status")
    public ResponseEntity<?> toggleStatus(@PathVariable String id) {
        try {
            boolean isOpen = restaurantOwnerService.toggleRestaurantStatus(id);
            return ResponseEntity.ok("Restaurant is now " + (isOpen ? "OPEN" : "CLOSED"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
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



}

