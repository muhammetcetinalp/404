package com.backend.delivery_backend.controller;

import com.backend.delivery_backend.model.*;
import com.backend.delivery_backend.repository.*;
import com.backend.delivery_backend.DTO.CustomerDTO;
// import jakarta.annotation.security.RolesAllowed; // Not used currently
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional; // Import Transactional

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
    @Autowired private MenuItemRepository menuItemRepository;
    @Autowired private CourierRestaurantRequestRepository courierRestaurantRequestRepository;
    @Autowired private TokenRepository tokenRepository;
    // FeedbackRepository would be needed for feedback deletion
    // @Autowired private FeedbackRepository feedbackRepository;


    // Kullanıcının kendi profilini getirme
    @GetMapping
    public ResponseEntity<?> getProfile(Authentication auth) {
        String email = auth.getName();

        Customer customer = customerRepository.findByEmail(email);
        if (customer != null) {
            CustomerDTO customerDTO = new CustomerDTO(customer);
            return ResponseEntity.ok(Map.of("profile", customerDTO));
        }

        Courier courier = courierRepository.findByEmail(email);
        if (courier != null)
            return ResponseEntity.ok(courier);

        RestaurantOwner restaurantOwner = restaurantOwnerRepository.findByEmail(email);
        if (restaurantOwner != null)
            return ResponseEntity.ok(restaurantOwner);

        // Check for Admin if admins can view their profile via this endpoint
        // Admin admin = adminRepository.findByEmail(email);
        // if (admin != null) return ResponseEntity.ok(admin);


        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
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

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
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

        // Ensure favorites set is initialized
        if (customer.getFavoriteRestaurants() == null) {
            customer.setFavoriteRestaurants(new HashSet<>());
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
        // Ensure favorites set is initialized before sending
        if (customer.getFavoriteRestaurants() == null) {
            customer.setFavoriteRestaurants(new HashSet<>());
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

        if (customer.getFavoriteRestaurants() == null) {
            return ResponseEntity.ok("Restaurant is not in favorites.");
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

    @DeleteMapping("/delete")
    @Transactional // Ensure all database operations are part of a single transaction
    public ResponseEntity<?> deleteAccount(Authentication auth) {
        String email = auth.getName();
        List<String> nonCancellableStatuses = Arrays.asList("PENDING", "IN_PROGRESS", "PREPARING", "READY", "PICKED_UP");
        // Alternative: final statuses are "DELIVERED", "CANCELLED". Check for orders NOT IN these.
        List<String> finalStatuses = Arrays.asList("DELIVERED", "CANCELLED");


        User userToDelete = null;
        String userRole = "";

        Customer customer = customerRepository.findByEmail(email);
        if (customer != null) {
            userToDelete = customer;
            userRole = "CUSTOMER";
            List<Order> activeOrders = orderRepository.findByCustomerCustomerIdAndOrderStatusNotIn(customer.getCustomerId(), finalStatuses);
            if (!activeOrders.isEmpty()) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body("Cannot delete account. You have active orders. Please wait for them to be delivered or cancel them if possible.");
            }
        } else {
            RestaurantOwner ro = restaurantOwnerRepository.findByEmail(email);
            if (ro != null) {
                userToDelete = ro;
                userRole = "RESTAURANT_OWNER";
                List<Order> activeOrders = orderRepository.findByRestaurantRestaurantIdAndOrderStatusNotIn(ro.getRestaurantId(), finalStatuses);
                if (!activeOrders.isEmpty()) {
                    return ResponseEntity.status(HttpStatus.CONFLICT)
                            .body("Cannot delete account. Your restaurant has active orders. Please ensure all orders are completed or cancelled.");
                }
            } else {
                Courier courier = courierRepository.findByEmail(email);
                if (courier != null) {
                    userToDelete = courier;
                    userRole = "COURIER";
                    List<Order> activeOrders = orderRepository.findByCourierCourierIdAndOrderStatusNotIn(courier.getCourierId(), finalStatuses);
                    if (!activeOrders.isEmpty()) {
                        return ResponseEntity.status(HttpStatus.CONFLICT)
                                .body("Cannot delete account. You have active deliveries assigned. Please complete or ensure they are reassigned.");
                    }
                }
            }
        }

        if (userToDelete == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found.");
        }

        // Delete PasswordResetToken
        PasswordResetToken token = tokenRepository.findByUserId(userToDelete.getId());
        if (token != null) {
            tokenRepository.delete(token);
        }

        // Specific cleanup based on role
        switch (userRole) {
            case "CUSTOMER":
                Customer cust = (Customer) userToDelete;
                Cart cart = cartRepository.findByCustomerId(cust.getCustomerId());
                if (cart != null) {
                    cartRepository.delete(cart);
                }
                // feedbackRepository.deleteAllByCustomer(cust); // If feedback needs cleanup
                customerRepository.delete(cust);
                break;
            case "RESTAURANT_OWNER":
                RestaurantOwner owner = (RestaurantOwner) userToDelete;
                // Disassociate couriers
                List<Courier> assignedCouriers = courierRepository.findByRestaurantOwnerRestaurantId(owner.getRestaurantId());
                for (Courier c : assignedCouriers) {
                    c.setRestaurantOwner(null);
                    courierRepository.save(c);
                }
                // Delete MenuItems
                List<MenuItem> menuItems = menuItemRepository.findByRestaurantRestaurantId(owner.getRestaurantId());
                menuItemRepository.deleteAll(menuItems);
                // Delete CourierRestaurantRequests related to this restaurant
                List<CourierRestaurantRequest> crRequestsRestaurant = courierRestaurantRequestRepository.findByRestaurantRestaurantId(owner.getRestaurantId());
                courierRestaurantRequestRepository.deleteAll(crRequestsRestaurant);
                // feedbackRepository.deleteAllByRestaurant(owner); // If feedback needs cleanup
                // Remove this restaurant from customers' favorite lists
                List<Customer> customersWithFavorite = customerRepository.findAll(); // Inefficient, better to have a direct query if possible
                for(Customer cFav : customersWithFavorite) {
                    if(cFav.getFavoriteRestaurants() != null && cFav.getFavoriteRestaurants().contains(owner)) {
                        cFav.getFavoriteRestaurants().remove(owner);
                        customerRepository.save(cFav);
                    }
                }
                restaurantOwnerRepository.delete(owner);
                break;
            case "COURIER":
                Courier cour = (Courier) userToDelete;
                // Unassign from any orders (though active check should prevent this for non-final statuses)
                List<Order> assignedOrders = orderRepository.findByCourierId(cour.getCourierId());
                for (Order o : assignedOrders) {
                    o.setCourier(null); // Or reassign logic
                    orderRepository.save(o);
                }
                // Delete CourierRestaurantRequests initiated by this courier
                List<CourierRestaurantRequest> crRequestsCourier = courierRestaurantRequestRepository.findByCourierCourierId(cour.getCourierId());
                courierRestaurantRequestRepository.deleteAll(crRequestsCourier);
                // feedbackRepository.deleteAllByCourier(cour); // If feedback needs cleanup
                courierRepository.delete(cour);
                break;
        }

        return ResponseEntity.ok("Account deleted successfully.");
    }
}