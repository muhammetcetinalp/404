package com.backend.delivery_backend.controller;

import com.backend.delivery_backend.model.*;
import com.backend.delivery_backend.repository.*;
import com.backend.delivery_backend.DTO.CustomerDTO;
import jakarta.annotation.security.RolesAllowed;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.*;

import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    @Autowired private CustomerRepository customerRepository;
    @Autowired private CourierRepository courierRepository;
    @Autowired private RestaurantOwnerRepository restaurantOwnerRepository;
    @Autowired private OrderRepository orderRepository;
    @Autowired private CartRepository cartRepository;

    // Kullanıcının kendi profilini getirme
    @GetMapping
    public ResponseEntity<?> getProfile(Authentication auth) {
        String email = auth.getName();

        Customer customer = customerRepository.findByEmail(email);
        if (customer != null) {
            CustomerDTO customerDTO = new CustomerDTO(customer);
            return ResponseEntity.ok(Map.of("profile", customerDTO));
        }

        if (courierRepository.findByEmail(email) != null)
            return ResponseEntity.ok(courierRepository.findByEmail(email));

        if (restaurantOwnerRepository.findByEmail(email) != null)
            return ResponseEntity.ok(restaurantOwnerRepository.findByEmail(email));

        return ResponseEntity.status(404).body("User not found");
    }

    @PutMapping("/update")
    public ResponseEntity<?> updateProfile(Authentication auth, @RequestBody Map<String, Object> updates) {
        String email = auth.getName();

        Customer c = customerRepository.findByEmail(email);
        if (c != null) {
            applyCustomerUpdates(c, updates);
            customerRepository.save(c);
            return ResponseEntity.ok("Profile updated");
        }

        Courier courier = courierRepository.findByEmail(email);
        if (courier != null) {
            applyCourierUpdates(courier, updates);
            courierRepository.save(courier);
            return ResponseEntity.ok("Profile updated");
        }

        RestaurantOwner ro = restaurantOwnerRepository.findByEmail(email);
        if (ro != null) {
            applyRestaurantUpdates(ro, updates);
            restaurantOwnerRepository.save(ro);
            return ResponseEntity.ok("Profile updated");
        }

        return ResponseEntity.status(404).body("User not found");
    }

    private void applyCustomerUpdates(Customer c, Map<String, Object> updates) {
        if (updates.containsKey("name")) c.setName((String) updates.get("name"));
        if (updates.containsKey("phone")) c.setPhone((String) updates.get("phone"));
        if (updates.containsKey("city")) c.setCity((String) updates.get("city"));
        if (updates.containsKey("district")) c.setDistrict((String) updates.get("district"));
        if (updates.containsKey("address")) c.setAddress((String) updates.get("address"));
    }

    private void applyCourierUpdates(Courier c, Map<String, Object> updates) {
        if (updates.containsKey("name")) c.setName((String) updates.get("name"));
        if (updates.containsKey("phone")) c.setPhone((String) updates.get("phone"));
    }

    private void applyRestaurantUpdates(RestaurantOwner ro, Map<String, Object> updates) {
        if (updates.containsKey("name")) ro.setName((String) updates.get("name"));
        if (updates.containsKey("phone")) ro.setPhone((String) updates.get("phone"));
        if (updates.containsKey("city")) ro.setCity((String) updates.get("city"));
        if (updates.containsKey("district")) ro.setDistrict((String) updates.get("district"));
        if (updates.containsKey("address")) ro.setAddress((String) updates.get("address"));
        if (updates.containsKey("businessHoursStart")) ro.setBusinessHoursStart((String) updates.get("businessHoursStart"));
        if (updates.containsKey("businessHoursEnd")) ro.setBusinessHoursEnd((String) updates.get("businessHoursEnd"));
    }

    // FAVORİ EKLEME ENDPOINTİ
    @PreAuthorize("hasRole('CUSTOMER')")
    @PostMapping("/favorites/add")
    public ResponseEntity<?> addFavoriteRestaurant(@RequestParam String restaurantId, Authentication authentication) {
        String email = authentication.getName();
        Customer customer = customerRepository.findByEmail(email);
        RestaurantOwner restaurant = restaurantOwnerRepository.findByRestaurantId(restaurantId);

        if (customer == null || restaurant == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Customer or restaurant not found");
        }

        Set<RestaurantOwner> favorites = customer.getFavoriteRestaurants();

        if (favorites.contains(restaurant)) {
            return ResponseEntity.ok("Restaurant is already in favorites.");
        }

        favorites.add(restaurant);
        customer.setFavoriteRestaurants(favorites);
        customerRepository.save(customer);

        return ResponseEntity.ok("Restaurant added to favorites.");
    }

    // FAVORİ RESTORANLARI GETİRME ENDPOINTİ
    @PreAuthorize("hasRole('CUSTOMER')")
    @GetMapping("/favorites")
    public ResponseEntity<?> getFavoriteRestaurants(Authentication authentication) {
        String email = authentication.getName();
        Customer customer = customerRepository.findByEmail(email);

        if (customer == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Customer not found");
        }

        return ResponseEntity.ok(customer.getFavoriteRestaurants());
    }

    // FAVORİDEN ÇIKARMA ENDPOINTİ
    @PreAuthorize("hasRole('CUSTOMER')")
    @DeleteMapping("/favorites/remove")
    public ResponseEntity<?> removeFavoriteRestaurant(@RequestParam String restaurantId, Authentication authentication) {
        String email = authentication.getName();
        Customer customer = customerRepository.findByEmail(email);
        RestaurantOwner restaurant = restaurantOwnerRepository.findByRestaurantId(restaurantId);

        if (customer == null || restaurant == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Customer or restaurant not found");
        }

        Set<RestaurantOwner> favorites = customer.getFavoriteRestaurants();

        if (!favorites.contains(restaurant)) {
            return ResponseEntity.ok("Restaurant is not in favorites.");
        }

        favorites.remove(restaurant);
        customer.setFavoriteRestaurants(favorites);
        customerRepository.save(customer);

        return ResponseEntity.ok("Restaurant removed from favorites.");
    }
}