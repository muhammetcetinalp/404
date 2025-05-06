package com.backend.delivery_backend.controller;

import com.backend.delivery_backend.DTO.UserDTO;
import com.backend.delivery_backend.model.*;
import java.util.List;
import java.util.Arrays; // Added for Arrays.asList
import com.backend.delivery_backend.repository.*;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.HashSet; // For favorite restaurants initialization

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    @Autowired private CustomerRepository customerRepository;
    @Autowired private CourierRepository courierRepository;
    @Autowired private RestaurantOwnerRepository restaurantOwnerRepository;
    @Autowired private AdminRepository adminRepository;
    @Autowired private BCryptPasswordEncoder passwordEncoder;
    @Autowired private OrderRepository orderRepository;

    // Add repositories needed for comprehensive deletion and updates
    @Autowired private CartRepository cartRepository;
    @Autowired private MenuItemRepository menuItemRepository;
    @Autowired private CourierRestaurantRequestRepository courierRestaurantRequestRepository;
    @Autowired private TokenRepository tokenRepository;

    @GetMapping("/all-users")
    public ResponseEntity<?> getAllUsers() {
        return ResponseEntity.ok(Map.of(
                "customers", customerRepository.findAll(),
                "couriers", courierRepository.findAll(),
                "restaurantOwners", restaurantOwnerRepository.findAll(),
                "admins", adminRepository.findAll()
        ));
    }

    @DeleteMapping("/delete-user/{email}")
    @Transactional // Ensure all database operations are part of a single transaction
    public ResponseEntity<?> deleteUserByEmail(@PathVariable String email) {
        List<String> finalStatuses = Arrays.asList("DELIVERED", "CANCELLED");
        User userToDelete = null;
        String userRole = ""; // To identify the role for specific cleanup

        Customer customer = customerRepository.findByEmail(email);
        if (customer != null) {
            userToDelete = customer;
            userRole = "CUSTOMER";
            List<Order> activeOrders = orderRepository.findByCustomerCustomerIdAndOrderStatusNotIn(customer.getCustomerId(), finalStatuses);
            if (!activeOrders.isEmpty()) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body("Cannot delete customer: " + customer.getName() + ". They have active orders. Please wait for orders to be delivered or cancelled.");
            }
        } else {
            Courier courier = courierRepository.findByEmail(email);
            if (courier != null) {
                userToDelete = courier;
                userRole = "COURIER";
                List<Order> activeOrders = orderRepository.findByCourierCourierIdAndOrderStatusNotIn(courier.getCourierId(), finalStatuses);
                if (!activeOrders.isEmpty()) {
                    return ResponseEntity.status(HttpStatus.CONFLICT)
                            .body("Cannot delete courier: " + courier.getName() + ". They have active deliveries assigned.");
                }
            } else {
                RestaurantOwner ro = restaurantOwnerRepository.findByEmail(email);
                if (ro != null) {
                    userToDelete = ro;
                    userRole = "RESTAURANT_OWNER";
                    List<Order> activeOrders = orderRepository.findByRestaurantRestaurantIdAndOrderStatusNotIn(ro.getRestaurantId(), finalStatuses);
                    if (!activeOrders.isEmpty()) {
                        return ResponseEntity.status(HttpStatus.CONFLICT)
                                .body("Cannot delete restaurant owner: " + ro.getName() + ". Their restaurant has active orders.");
                    }
                } else {
                    Admin admin = adminRepository.findByEmail(email);
                    if (admin != null) {
                        // Prevent deletion of any admin account through this endpoint
                        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                                .body("Admin accounts (" + admin.getName() + ") cannot be deleted through this panel. This action is restricted.");
                    }
                }
            }
        }

        if (userToDelete == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User with email " + email + " not found.");
        }

        // Delete PasswordResetToken for all user types before deleting the user
        PasswordResetToken token = tokenRepository.findByUserId(userToDelete.getId());
        if (token != null) {
            tokenRepository.delete(token);
        }

        String deletedUserName = userToDelete.getName(); // Get name before deletion for the message

        switch (userRole) {
            case "CUSTOMER":
                Customer cust = (Customer) userToDelete;
                Cart cart = cartRepository.findByCustomerId(cust.getCustomerId());
                if (cart != null) {
                    cartRepository.delete(cart);
                }
                // Remove customer from favorite lists of restaurants is not direct.
                // Restaurant's favorite list is on Customer entity.
                // When deleting orders, ensure constraints are handled (e.g. feedback related to orders)
                // Consider if orders themselves should be deleted or anonymized for historical data
                customerRepository.delete(cust);
                break;
            case "COURIER":
                Courier cour = (Courier) userToDelete;
                // Unassign from any orders (active order check already done)
                List<Order> assignedOrdersToCourier = orderRepository.findByCourierId(cour.getCourierId());
                for (Order o : assignedOrdersToCourier) {
                    o.setCourier(null);
                    orderRepository.save(o);
                }
                List<CourierRestaurantRequest> crRequestsCourier = courierRestaurantRequestRepository.findByCourierCourierId(cour.getCourierId());
                courierRestaurantRequestRepository.deleteAll(crRequestsCourier);
                courierRepository.delete(cour);
                break;
            case "RESTAURANT_OWNER":
                RestaurantOwner owner = (RestaurantOwner) userToDelete;
                // Disassociate couriers assigned to this restaurant
                List<Courier> assignedCouriers = courierRepository.findByRestaurantOwnerRestaurantId(owner.getRestaurantId());
                for (Courier cItem : assignedCouriers) {
                    cItem.setRestaurantOwner(null);
                    courierRepository.save(cItem);
                }
                // Delete MenuItems
                List<MenuItem> menuItems = menuItemRepository.findByRestaurantRestaurantId(owner.getRestaurantId());
                menuItemRepository.deleteAll(menuItems);
                // Delete CourierRestaurantRequests related to this restaurant
                List<CourierRestaurantRequest> crRequestsRestaurant = courierRestaurantRequestRepository.findByRestaurantRestaurantId(owner.getRestaurantId());
                courierRestaurantRequestRepository.deleteAll(crRequestsRestaurant);
                // Remove this restaurant from customers' favorite lists
                List<Customer> customersWithFavorite = customerRepository.findAll();
                for (Customer cFav : customersWithFavorite) {
                    if (cFav.getFavoriteRestaurants() != null && cFav.getFavoriteRestaurants().contains(owner)) {
                        cFav.getFavoriteRestaurants().remove(owner);
                        customerRepository.save(cFav);
                    }
                }
                // Consider if orders related to this restaurant should be handled (e.g. anonymized, marked as from deleted restaurant)
                restaurantOwnerRepository.delete(owner);
                break;
            default:
                // This case should ideally not be reached if userToDelete was found and userRole set.
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error determining user type for deletion.");
        }

        return ResponseEntity.ok("User " + deletedUserName + " (" + userRole + ") deleted successfully.");
    }

    @PostMapping("/add-admin")
    public ResponseEntity<?> createAdmin(@RequestBody UserDTO dto) {
        // Check if email already exists in any user table before creating admin
        if (customerRepository.findByEmail(dto.getEmail()) != null ||
                courierRepository.findByEmail(dto.getEmail()) != null ||
                restaurantOwnerRepository.findByEmail(dto.getEmail()) != null ||
                adminRepository.findByEmail(dto.getEmail()) != null) {
            return ResponseEntity.badRequest().body("Email is already in use by another account.");
        }
        try {
            Admin admin = new Admin();
            admin.setName(dto.getName());
            admin.setEmail(dto.getEmail());
            admin.setPassword(passwordEncoder.encode(dto.getPassword()));
            admin.setPhone(dto.getPhone());
            admin.setRole("ADMIN"); // Role is fixed as ADMIN
            admin.setAccountStatus("ACTIVE"); // Default account status
            adminRepository.save(admin);
            return ResponseEntity.ok("New admin created: " + admin.getName());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Admin could not be created: " + e.getMessage());
        }
    }

    @GetMapping("/user/{email}")
    public ResponseEntity<?> getUserDetails(@PathVariable String email) {
        Customer c = customerRepository.findByEmail(email);
        if (c != null) return ResponseEntity.ok(c);
        Courier cr = courierRepository.findByEmail(email);
        if (cr != null) return ResponseEntity.ok(cr);
        RestaurantOwner ro = restaurantOwnerRepository.findByEmail(email);
        if (ro != null) return ResponseEntity.ok(ro);
        Admin admin = adminRepository.findByEmail(email);
        if (admin != null) return ResponseEntity.ok(admin);

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
    }

    @PutMapping("/update-user/{email}")
    @Transactional
    public ResponseEntity<?> updateUser(@PathVariable String email, @RequestBody Map<String, Object> updates) {
        User userToUpdate = null;
        String originalRole = null; // To track if role is being changed

        Customer c = customerRepository.findByEmail(email);
        if (c != null) {
            userToUpdate = c;
            originalRole = c.getRole();
            applyGeneralUserUpdates(c, updates); // Apply common fields like name, phone, accountStatus
            if (updates.containsKey("address")) c.setAddress((String) updates.get("address"));
            if (updates.containsKey("city")) c.setCity((String) updates.get("city"));
            if (updates.containsKey("district")) c.setDistrict((String) updates.get("district"));
            customerRepository.save(c);
        } else {
            Courier cr = courierRepository.findByEmail(email);
            if (cr != null) {
                userToUpdate = cr;
                originalRole = cr.getRole();
                applyGeneralUserUpdates(cr, updates);
                courierRepository.save(cr);
            } else {
                RestaurantOwner ro = restaurantOwnerRepository.findByEmail(email);
                if (ro != null) {
                    userToUpdate = ro;
                    originalRole = ro.getRole();
                    String previousAccountStatus = ro.getAccountStatus(); // For order cancellation logic

                    applyGeneralUserUpdates(ro, updates);
                    if (updates.containsKey("address")) ro.setAddress((String) updates.get("address"));
                    if (updates.containsKey("city")) ro.setCity((String) updates.get("city"));
                    if (updates.containsKey("district")) ro.setDistrict((String) updates.get("district"));
                    if (updates.containsKey("businessHoursStart")) ro.setBusinessHoursStart((String) updates.get("businessHoursStart"));
                    if (updates.containsKey("businessHoursEnd")) ro.setBusinessHoursEnd((String) updates.get("businessHoursEnd"));
                    if (updates.containsKey("cuisineType")) ro.setCuisineType((String) updates.get("cuisineType"));
                    if (updates.containsKey("deliveryType")) {
                        try {
                            ro.setDeliveryType(com.backend.delivery_backend.ENUM.DeliveryType.valueOf(((String) updates.get("deliveryType")).toUpperCase()));
                        } catch (IllegalArgumentException e) {
                            // Optionally, log this error or return a bad request
                            System.err.println("Invalid delivery type provided: " + updates.get("deliveryType"));
                        }
                    }
                    if (updates.containsKey("approved") && updates.get("approved") instanceof Boolean) {
                        ro.setApproved((Boolean) updates.get("approved"));
                    }

                    restaurantOwnerRepository.save(ro);

                    if ("SUSPENDED".equals(ro.getAccountStatus()) && !ro.getAccountStatus().equals(previousAccountStatus)) {
                        cancelPendingOrdersForRestaurant(ro.getRestaurantId());
                    }
                } else {
                    Admin adminUser = adminRepository.findByEmail(email);
                    if (adminUser != null) {
                        userToUpdate = adminUser;
                        originalRole = adminUser.getRole();
                        applyGeneralUserUpdates(adminUser, updates);
                        // Admins cannot change their role or status via this generic update method easily.
                        // Specific admin management should be handled carefully.
                        if (updates.containsKey("role") && !((String)updates.get("role")).equalsIgnoreCase("ADMIN")) {
                            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Admin role cannot be changed.");
                        }
                        if (updates.containsKey("status") && userToUpdate.getRole().equals("ADMIN")) {
                            // Potentially disallow status changes for admins here or make it very specific
                            // For now, applyGeneralUserUpdates handles it, but this could be a point of restriction.
                        }
                        adminRepository.save(adminUser);
                    }
                }
            }
        }

        if (userToUpdate == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found with email: " + email);
        }

        // Handle role changes - This is complex.
        // The current `applyGeneralUserUpdates` only updates the role string.
        // A true role change (e.g., Customer to Courier) would require deleting the old entity
        // and creating a new one, migrating data. This is a simplified approach.
        if (updates.containsKey("role")) {
            String newRoleString = ((String) updates.get("role")).toUpperCase();
            if (!originalRole.equalsIgnoreCase(newRoleString)) {
                // Prevent changing to/from ADMIN role via this generic endpoint for safety
                if (originalRole.equalsIgnoreCase("ADMIN") || newRoleString.equalsIgnoreCase("ADMIN")) {
                    if (!originalRole.equalsIgnoreCase(newRoleString)) { // Only if it's an actual change
                        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Changing to/from ADMIN role is not permitted here.");
                    }
                }
                // This only changes the role string field. It does NOT change the entity type in the database.
                // For the current setup, this might be acceptable if UserDetailsServiceImpl primarily relies on this string.
                // However, it's not a true polymorphic change.
                userToUpdate.setRole(newRoleString);
                // Re-save the correct entity type
                if (userToUpdate instanceof Customer) customerRepository.save((Customer)userToUpdate);
                else if (userToUpdate instanceof Courier) courierRepository.save((Courier)userToUpdate);
                else if (userToUpdate instanceof RestaurantOwner) restaurantOwnerRepository.save((RestaurantOwner)userToUpdate);
                // Admin role change is restricted above.
            }
        }


        return ResponseEntity.ok("User " + userToUpdate.getName() + " updated successfully.");
    }

    private void cancelPendingOrdersForRestaurant(String restaurantId) {
        List<Order> pendingOrders = orderRepository.findByRestaurantIdAndOrderStatus(restaurantId, "PENDING");
        for (Order order : pendingOrders) {
            order.setOrderStatus("CANCELLED");
            orderRepository.save(order);
        }
    }

    // Renamed from applyCommonUpdates to be more descriptive
    private void applyGeneralUserUpdates(User user, Map<String, Object> updates) {
        if (updates.containsKey("name")) user.setName((String) updates.get("name"));
        if (updates.containsKey("phone")) user.setPhone((String) updates.get("phone"));

        if (updates.containsKey("status")) {
            String newStatus = ((String) updates.get("status")).toUpperCase();
            if (Arrays.asList("ACTIVE", "SUSPENDED", "BANNED").contains(newStatus)) {
                // Prevent admin from changing their own status to BANNED/SUSPENDED easily if they are the only admin
                // This check is basic; more complex logic might be needed for multi-admin scenarios.
                if (user.getRole().equals("ADMIN") && (newStatus.equals("BANNED") || newStatus.equals("SUSPENDED"))) {
                    long adminCount = adminRepository.count();
                    if (adminCount <= 1 && user.getAccountStatus().equals("ACTIVE")) {
                        // Do not allow the last active admin to ban/suspend themselves.
                        // Optionally return an error or log a warning. For now, we just skip the update.
                        System.err.println("Attempt to change status of the only/last admin to " + newStatus + " was blocked.");
                        return; // Skip status update
                    }
                }
                user.setAccountStatus(newStatus);
            }
        }
        // Role string update is handled in the main updateUser method because it's more complex.
    }
}