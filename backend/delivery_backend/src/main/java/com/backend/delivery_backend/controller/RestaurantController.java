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
import org.springframework.http.HttpStatus; // HttpStatus ekle
import com.backend.delivery_backend.service.RestaurantOwnerService.OperationBlockedException; // MenuItemInUseException yerine
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.springframework.http.HttpStatus;
import java.util.HashMap;
import java.util.stream.Collectors;
import com.backend.delivery_backend.DTO.CourierDTO;
import com.backend.delivery_backend.ENUM.CourierStatus;
import com.backend.delivery_backend.model.Courier;
import com.backend.delivery_backend.repository.CourierRepository;
import com.backend.delivery_backend.model.Courier;
import com.backend.delivery_backend.DTO.CourierDTO;
import com.backend.delivery_backend.ENUM.CourierStatus;

import org.springframework.beans.factory.annotation.Autowired;


import java.util.stream.Collectors;





@RestController
@RequestMapping("/api/restaurants")
public class RestaurantController {

    private final RestaurantOwnerService restaurantOwnerService;
    private final RestaurantOwnerRepository restaurantOwnerRepository;
    @Autowired
    private CourierRepository courierRepository;

    public RestaurantController(RestaurantOwnerService restaurantOwnerService,RestaurantOwnerRepository restaurantOwnerRepository ) {
        this.restaurantOwnerService = restaurantOwnerService;
        this.restaurantOwnerRepository = restaurantOwnerRepository;
    }

    @GetMapping("/{id}/menu")
    public ResponseEntity<?> getMenu(@PathVariable String id) {
        // First check if the restaurant exists
        Optional<RestaurantOwner> restaurant = restaurantOwnerRepository.findById(id);
        if (restaurant.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Restaurant not found");
        }

        RestaurantOwner restaurantOwner = restaurant.get();

        // If restaurant is not approved, return 403 Forbidden
        if (!restaurantOwner.isApproved()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Restaurant is pending approval");
        }

        // Bu kısmı kaldırmanız/değiştirmeniz gerekiyor:
    /* If restaurant is banned or suspended, return 403 Forbidden
    if ("BANNED".equals(restaurantOwner.getAccountStatus()) || "SUSPENDED".equals(restaurantOwner.getAccountStatus())) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Restaurant is currently unavailable");
    }
    */

        // Yeni kod: Askıya alınmış restoranlara kendi menülerini görüntüleme izni verelim
        // Sadece BANNED olanlar için kısıtlama kalsın
        if ("BANNED".equals(restaurantOwner.getAccountStatus())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Restaurant is currently unavailable");
        }

        List<MenuItem> items = restaurantOwnerService.getMenuItemsByRestaurant(id);
        return ResponseEntity.ok(items);
    }

    @GetMapping("/api/restaurants/{restaurantId}/available-couriers")
    public List<CourierDTO> getAvailableCouriers(@PathVariable String restaurantId) {
        List<Courier> couriers = courierRepository.findByRestaurantOwnerRestaurantId(restaurantId)
                .stream()
                .filter(c -> c.getStatus() == CourierStatus.AVAILABLE)
                .toList();

        return couriers.stream().map(CourierDTO::new).collect(Collectors.toList());
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
            return ResponseEntity.ok("Menu item '" + updatedItem.getName() + "' updated successfully.");
        } catch (OperationBlockedException e) { // Bu özel hatayı yakala
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @DeleteMapping("/{restaurantId}/menu/{itemId}")
    public ResponseEntity<?> deleteMenuItem(@PathVariable String restaurantId,
                                            @PathVariable Long itemId) {
        try {
            restaurantOwnerService.deleteMenuItem(restaurantId, itemId);
            return ResponseEntity.ok("Menu item deleted successfully.");
        } catch (OperationBlockedException e) { // Bu özel hatayı yakala
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
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

        RestaurantOwner restaurantOwner = restaurant.get();

        // If restaurant is not approved, return 403 Forbidden
        if (!restaurantOwner.isApproved()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Restaurant is pending approval");
        }

        // If restaurant is banned or suspended, return 403 Forbidden
        if ("BANNED".equals(restaurantOwner.getAccountStatus()) || "SUSPENDED".equals(restaurantOwner.getAccountStatus())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Restaurant is currently unavailable");
        }

        boolean isOpen = restaurantOwner.isOpen();  // açık mı?
        return ResponseEntity.ok(new RestaurantStatusDTO(isOpen));
    }

    @GetMapping("/public")
    public ResponseEntity<?> getAllApprovedRestaurants() {
        List<RestaurantOwner> restaurants = restaurantOwnerRepository.findByApprovedTrue();
        // Hesap durumu aktif olan restoranları filtrele
        restaurants = restaurants.stream()
                .filter(r -> !"BANNED".equals(r.getAccountStatus()) && !"SUSPENDED".equals(r.getAccountStatus()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(restaurants);
    }
}