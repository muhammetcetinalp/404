package com.backend.delivery_backend.controller;

import com.backend.delivery_backend.model.*;
import com.backend.delivery_backend.repository.*;
import com.backend.delivery_backend.DTO.CustomerDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import com.backend.delivery_backend.ENUM.DeliveryType; // Gerekliyse ekleyin

import com.backend.delivery_backend.ENUM.OrderStatus;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    private static final Logger logger = LoggerFactory.getLogger(ProfileController.class);

    @Autowired private CustomerRepository customerRepository;
    @Autowired private CourierRepository courierRepository;
    @Autowired private RestaurantOwnerRepository restaurantOwnerRepository;
    @Autowired private OrderRepository orderRepository;
    @Autowired private CartRepository cartRepository;
    @Autowired private MenuItemRepository menuItemRepository;
    @Autowired private CourierRestaurantRequestRepository courierRestaurantRequestRepository;
    @Autowired private TokenRepository tokenRepository;
    // @Autowired private FeedbackRepository feedbackRepository; // Eğer siparişle ilişkili feedback varsa

    // ... (getProfile, updateProfile, favorites metodları aynı kalacak) ...
    // GETPROFILE
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

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
    }

    // UPDATEPROFILE
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
        // Add cuisineType and deliveryType if they are updatable from profile
        if (updates.containsKey("cuisineType")) ro.setCuisineType((String) updates.get("cuisineType"));
        /**
        if (updates.containsKey("deliveryType") && updates.get("deliveryType") != null) {
            try {
                ro.setDeliveryType(com.backend.delivery_backend.ENUM.DeliveryType.valueOf(((String)updates.get("deliveryType")).toUpperCase()));
            } catch (IllegalArgumentException e) {
                logger.warn("Invalid delivery type provided for update: {}", updates.get("deliveryType"));
            }
        }
         **/
    }

    // FAVORITES
    @PreAuthorize("hasRole('CUSTOMER')")
    @PostMapping("/favorites/add")
    public ResponseEntity<?> addFavoriteRestaurant(@RequestParam String restaurantId, Authentication authentication) {
        String email = authentication.getName();
        Customer customer = customerRepository.findByEmail(email);
        RestaurantOwner restaurant = restaurantOwnerRepository.findByRestaurantId(restaurantId);

        if (customer == null || restaurant == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Customer or restaurant not found");
        }
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

    @PreAuthorize("hasRole('CUSTOMER')")
    @GetMapping("/favorites")
    public ResponseEntity<?> getFavoriteRestaurants(Authentication authentication) {
        String email = authentication.getName();
        Customer customer = customerRepository.findByEmail(email);
        if (customer == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Customer not found");
        }
        if (customer.getFavoriteRestaurants() == null) {
            customer.setFavoriteRestaurants(new HashSet<>());
        }
        return ResponseEntity.ok(customer.getFavoriteRestaurants());
    }

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
    @Transactional
    public ResponseEntity<?> deleteAccount(Authentication auth) {
        String email = auth.getName();
        logger.info("Attempting self-account deletion for user: {}", email);

        List<String> finalStatuses = Arrays.asList(
                OrderStatus.DELIVERED.name(),
                OrderStatus.CANCELLED.name()
        );

        User userToDelete = null;
        String userRole = "";

        Customer customer = customerRepository.findByEmail(email);
        if (customer != null) {
            userToDelete = customer;
            userRole = "CUSTOMER";
            List<Order> activeOrders = orderRepository.findByCustomerCustomerIdAndOrderStatusNotIn(customer.getCustomerId(), finalStatuses);
            if (!activeOrders.isEmpty()) {
                String activeOrderDetails = activeOrders.stream()
                        .map(o -> "ID: " + o.getOrderId() + ", Status: " + o.getOrderStatus())
                        .collect(Collectors.joining("; "));
                logger.warn("Cannot delete customer {}: Active orders found - {}", email, activeOrderDetails);
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body("Cannot delete account. You have active orders: " + activeOrderDetails + ". Please wait for them to be delivered or cancel them if possible.");
            }
        } else {
            RestaurantOwner ro = restaurantOwnerRepository.findByEmail(email);
            if (ro != null) {
                userToDelete = ro;
                userRole = "RESTAURANT_OWNER";
                List<Order> activeOrders = orderRepository.findByRestaurantRestaurantIdAndOrderStatusNotIn(ro.getRestaurantId(), finalStatuses);
                if (!activeOrders.isEmpty()) {
                    String activeOrderDetails = activeOrders.stream()
                            .map(o -> "ID: " + o.getOrderId() + ", Status: " + o.getOrderStatus())
                            .collect(Collectors.joining("; "));
                    logger.warn("Cannot delete restaurant owner {}: Active orders found for restaurant {} - {}", email, ro.getRestaurantId(), activeOrderDetails);
                    return ResponseEntity.status(HttpStatus.CONFLICT)
                            .body("Cannot delete account. Your restaurant has active orders: " + activeOrderDetails + ". Please ensure all orders are completed or cancelled.");
                }
            } else {
                Courier courier = courierRepository.findByEmail(email);
                if (courier != null) {
                    userToDelete = courier;
                    userRole = "COURIER";
                    List<Order> activeOrders = orderRepository.findByCourierCourierIdAndOrderStatusNotIn(courier.getCourierId(), finalStatuses);
                    if (!activeOrders.isEmpty()) {
                        String activeOrderDetails = activeOrders.stream()
                                .map(o -> "ID: " + o.getOrderId() + ", Status: " + o.getOrderStatus())
                                .collect(Collectors.joining("; "));
                        logger.warn("Cannot delete courier {}: Active deliveries found - {}", email, activeOrderDetails);
                        return ResponseEntity.status(HttpStatus.CONFLICT)
                                .body("Cannot delete account. You have active deliveries assigned: " + activeOrderDetails + ". Please complete or ensure they are reassigned.");
                    }
                }
            }
        }

        if (userToDelete == null) {
            logger.warn("Attempted to delete account for email {}, but user was not found.", email);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found.");
        }

        logger.info("Proceeding with account deletion for user: {} with role: {}", email, userRole);

        PasswordResetToken token = tokenRepository.findByUserId(userToDelete.getId());
        if (token != null) {
            logger.debug("Deleting password reset token for user {}", userToDelete.getId());
            tokenRepository.delete(token);
        }

        switch (userRole) {
            case "CUSTOMER":
                Customer cust = (Customer) userToDelete;
                logger.debug("Performing customer-specific cleanup for {}", cust.getEmail());

                // Nullify customer reference in orders
                List<Order> customerOrders = orderRepository.findByCustomerCustomerId(cust.getCustomerId()); // findByCustomerId
                if (!customerOrders.isEmpty()) {
                    logger.info("Nullifying customer reference in {} orders for customer {}", customerOrders.size(), cust.getEmail());
                    for (Order order : customerOrders) {
                        order.setCustomer(null);
                        orderRepository.save(order);
                    }
                }
                // Nullify customer reference in feedbacks (if applicable and Feedback has a Customer field)
                // List<Feedback> customerFeedbacks = feedbackRepository.findByCustomerId(cust.getCustomerId());
                // for (Feedback feedback : customerFeedbacks) {
                //     feedback.setCustomer(null);
                //     feedbackRepository.save(feedback);
                // }


                Cart cart = cartRepository.findByCustomerId(cust.getCustomerId());
                if (cart != null) {
                    logger.debug("Deleting cart for customer {}", cust.getCustomerId());
                    cartRepository.delete(cart);
                }
                customerRepository.delete(cust);
                break;
            case "RESTAURANT_OWNER":
                RestaurantOwner owner = (RestaurantOwner) userToDelete;
                logger.debug("Performing restaurant owner-specific cleanup for {}", owner.getEmail());

                // 1. Nullify restaurant reference in orders (Bu zaten yapılıyor ve doğru)
                List<Order> restaurantOrders = orderRepository.findByRestaurantRestaurantId(owner.getRestaurantId());
                if (!restaurantOrders.isEmpty()) {
                    logger.info("Nullifying restaurant reference in {} orders for restaurant {}", restaurantOrders.size(), owner.getName());
                    for (Order order : restaurantOrders) {
                        order.setRestaurant(null);
                        orderRepository.save(order);
                    }
                }

                // 2. Handle MenuItems and their relation to order_items
                List<MenuItem> menuItemsToDelete = menuItemRepository.findByRestaurantRestaurantId(owner.getRestaurantId());
                if (!menuItemsToDelete.isEmpty()) {
                    logger.info("Preparing to delete {} menu items for restaurant {}. First, removing them from existing orders' items.", menuItemsToDelete.size(), owner.getName());

                    // TÜM SİPARİŞLERİ GETİR (Bu verimsiz olabilir, optimize edilebilir)
                    // Daha iyi bir yol: Sadece bu restorana ait menü öğelerini içeren siparişleri getirmek.
                    // Ancak @ElementCollection ile bu karmaşık olabilir. Şimdilik basit tutalım.
                    List<Order> allOrders = orderRepository.findAll(); // Bütün siparişleri çekmek yerine daha hedefli bir sorgu daha iyi olurdu.

                    for (MenuItem itemToDelete : menuItemsToDelete) {
                        for (Order order : allOrders) { // Bu döngü çok maliyetli olabilir büyük veri setlerinde
                            if (order.getItems() != null && order.getItems().containsKey(itemToDelete)) {
                                logger.debug("Removing MenuItem ID {} from Order ID {}", itemToDelete.getId(), order.getOrderId());
                                order.getItems().remove(itemToDelete);
                                orderRepository.save(order); // Siparişi güncelle
                            }
                        }
                    }
                    // Şimdi MenuItem'lar güvenle silinebilir çünkü order_items'da referans kalmadı.
                    logger.debug("Deleting {} menu items for restaurant {}", menuItemsToDelete.size(), owner.getRestaurantId());
                    menuItemRepository.deleteAll(menuItemsToDelete);
                }


                // 3. Disassociate Couriers (Bu zaten yapılıyor ve doğru)
                List<Courier> assignedCouriers = courierRepository.findByRestaurantOwnerRestaurantId(owner.getRestaurantId());
                for (Courier c : assignedCouriers) {
                    logger.debug("Disassociating courier {} from restaurant {}", c.getCourierId(), owner.getRestaurantId());
                    c.setRestaurantOwner(null);
                    courierRepository.save(c);
                }

                // 4. Delete CourierRestaurantRequests (Bu zaten yapılıyor ve doğru)
                List<CourierRestaurantRequest> crRequestsRestaurant = courierRestaurantRequestRepository.findByRestaurantRestaurantId(owner.getRestaurantId());
                if (!crRequestsRestaurant.isEmpty()) {
                    logger.debug("Deleting {} courier restaurant requests for restaurant {}", crRequestsRestaurant.size(), owner.getRestaurantId());
                    courierRestaurantRequestRepository.deleteAll(crRequestsRestaurant);
                }

                // 5. Remove from Customer Favorites (Bu zaten yapılıyor ve doğru)
                List<Customer> customersWithFavorite = customerRepository.findAll();
                for(Customer cFav : customersWithFavorite) {
                    if(cFav.getFavoriteRestaurants() != null && cFav.getFavoriteRestaurants().contains(owner)) {
                        logger.debug("Removing restaurant {} from favorites of customer {}", owner.getName(), cFav.getEmail());
                        cFav.getFavoriteRestaurants().remove(owner);
                        customerRepository.save(cFav);
                    }
                }

                // 6. Finally, delete the restaurant owner
                restaurantOwnerRepository.delete(owner);
                break;
            case "COURIER":
                Courier cour = (Courier) userToDelete;
                logger.debug("Performing courier-specific cleanup for {}", cour.getEmail());
                List<Order> assignedOrders = orderRepository.findByCourierId(cour.getCourierId());
                for (Order o : assignedOrders) {
                    // For Couriers, we might want to unassign them from active orders too,
                    // or the active order check above should prevent deletion if they have non-final orders.
                    // If orders can exist without a courier (e.g., re-assignable), nullifying is okay.
                    logger.debug("Unassigning courier {} from order {}", cour.getCourierId(), o.getOrderId());
                    o.setCourier(null);
                    orderRepository.save(o);
                }
                // Nullify courier reference in feedbacks (if applicable)
                // List<Feedback> courierFeedbacks = feedbackRepository.findByCourierId(cour.getCourierId());
                // for (Feedback feedback : courierFeedbacks) {
                //     feedback.setCourier(null);
                //     feedbackRepository.save(feedback);
                // }

                List<CourierRestaurantRequest> crRequestsCourier = courierRestaurantRequestRepository.findByCourierCourierId(cour.getCourierId());
                if (!crRequestsCourier.isEmpty()) {
                    logger.debug("Deleting {} courier restaurant requests for courier {}", crRequestsCourier.size(), cour.getCourierId());
                    courierRestaurantRequestRepository.deleteAll(crRequestsCourier);
                }
                courierRepository.delete(cour);
                break;
        }

        logger.info("Account for {} deleted successfully.", email);
        return ResponseEntity.ok("Account deleted successfully.");
    }
}