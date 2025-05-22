package com.backend.delivery_backend.controller;

import com.backend.delivery_backend.DTO.FeedbackDTO;
import com.backend.delivery_backend.model.*;
import com.backend.delivery_backend.repository.*;
import com.backend.delivery_backend.service.FeedbackService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.UUID;
import java.util.Map;

@RestController
@RequestMapping("/api/feedback")
public class FeedbackController {

    @Autowired
    private FeedbackRepository feedbackRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private RestaurantOwnerRepository restaurantOwnerRepository;

    @Autowired
    private FeedbackService feedbackService;

    // DTO for restaurant rating and review
    public static class RestaurantRatingRequest {
        private int rating;
        private String review;

        public int getRating() {
            return rating;
        }

        public void setRating(int rating) {
            this.rating = rating;
        }

        public String getReview() {
            return review;
        }

        public void setReview(String review) {
            this.review = review;
        }
    }

    // Existing feedback submit method (for couriers and restaurants)
    @PreAuthorize("hasRole('CUSTOMER')")
    @PostMapping("/submit")
    public ResponseEntity<?> submitFeedback(Authentication auth, @RequestBody FeedbackDTO dto) {
        String email = auth.getName();
        Customer customer = customerRepository.findByEmail(email);
        if (customer == null) {
            return ResponseEntity.badRequest().body("Customer not found");
        }

        try {
            feedbackService.submitFeedback(email, dto);
            return ResponseEntity.ok("Feedback submitted successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Updated: Restaurant rating endpoint with review
    @PreAuthorize("hasRole('CUSTOMER')")
    @PostMapping("/restaurant-rating/{orderId}")
    public ResponseEntity<?> rateRestaurant(@PathVariable String orderId, Authentication auth, @RequestBody RestaurantRatingRequest request) {
        String email = auth.getName();
        Customer customer = customerRepository.findByEmail(email);
        if (customer == null) {
            return ResponseEntity.badRequest().body("Customer not found");
        }

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (!order.getCustomer().getCustomerId().equals(customer.getCustomerId())) {
            return ResponseEntity.status(403).body("You can only rate your own orders");
        }

        if (!"DELIVERED".equalsIgnoreCase(order.getOrderStatus())) {
            return ResponseEntity.badRequest().body("You can only rate delivered orders");
        }

        // Create feedback
        Feedback feedback = new Feedback();
        feedback.setId(UUID.randomUUID().toString());
        feedback.setOrder(order);
        feedback.setRestaurant(order.getRestaurant());
        feedback.setCustomer(customer);
        feedback.setRestaurantRating(request.getRating());
        feedback.setRestaurantReview(request.getReview());
        feedback.setCreatedAt(LocalDateTime.now());

        feedbackRepository.save(feedback);

        // Update restaurant rating average
        List<Feedback> restaurantFeedbacks = feedbackRepository.findAll().stream()
                .filter(f -> f.getRestaurant() != null && f.getRestaurant().getRestaurantId().equals(order.getRestaurant().getRestaurantId()))
                .filter(f -> f.getRestaurantRating() > 0)
                .toList();

        double avgRating = restaurantFeedbacks.stream()
                .mapToInt(Feedback::getRestaurantRating)
                .average()
                .orElse(0.0);

        RestaurantOwner restaurant = order.getRestaurant();
        restaurant.setRating((float) avgRating);
        restaurantOwnerRepository.save(restaurant);

        return ResponseEntity.ok("Thank you for rating the restaurant. Current average: " + avgRating);
    }

    // Updated: Make the endpoint accessible to all authenticated users
    @GetMapping("/restaurant/{restaurantId}")
    public ResponseEntity<?> getRestaurantFeedbacks(@PathVariable String restaurantId) {
        List<Feedback> feedbacks = feedbackRepository.findAll().stream()
                .filter(f -> f.getRestaurant() != null && f.getRestaurant().getRestaurantId().equals(restaurantId))
                .filter(f -> f.getRestaurantRating() > 0 || (f.getRestaurantReview() != null && !f.getRestaurantReview().isBlank()))
                .toList();

        List<Map<String, Object>> response = feedbacks.stream().map(f -> {
            Map<String, Object> map = new HashMap<>();
            map.put("orderId", f.getOrder().getOrderId());
            map.put("customerName", f.getCustomer() != null ? f.getCustomer().getName() : "Unknown");
            map.put("rating", f.getRestaurantRating());
            map.put("review", f.getRestaurantReview());
            map.put("createdAt", f.getCreatedAt());
            return map;
        }).toList();

        return ResponseEntity.ok(response);
    }

    @PreAuthorize("hasRole('CUSTOMER') or hasRole('RESTAURANT_OWNER') or hasRole('ADMIN')")
    @GetMapping("/restaurant/order/{orderId}")
    public ResponseEntity<?> getRestaurantFeedbackByOrder(@PathVariable String orderId) {
        Feedback feedback = feedbackRepository.findAll().stream()
                .filter(f -> f.getOrder() != null && f.getOrder().getOrderId().equals(orderId))
                .findFirst()
                .orElse(null);

        if (feedback == null) {
            return ResponseEntity.notFound().build();
        }

        Map<String, Object> response = new HashMap<>();
        response.put("orderId", feedback.getOrder().getOrderId());
        response.put("customerName", feedback.getCustomer() != null ? feedback.getCustomer().getName() : "Unknown");
        response.put("rating", feedback.getRestaurantRating());
        response.put("review", feedback.getRestaurantReview());
        response.put("createdAt", feedback.getCreatedAt());

        return ResponseEntity.ok(response);
    }

    @PreAuthorize("hasRole('CUSTOMER')")
    @GetMapping("/rated-orders")
    public ResponseEntity<?> getRatedOrders(Authentication auth) {
        String email = auth.getName();
        Customer customer = customerRepository.findByEmail(email);
        if (customer == null) {
            return ResponseEntity.badRequest().body("Customer not found");
        }

        List<String> ratedOrderIds = feedbackRepository.findAll().stream()
                .filter(f -> f.getCustomer() != null && f.getCustomer().getCustomerId().equals(customer.getCustomerId()))
                .map(f -> f.getOrder().getOrderId())
                .toList();

        return ResponseEntity.ok(ratedOrderIds);
    }
    @PreAuthorize("hasRole('CUSTOMER')")
    @PutMapping("/restaurant-rating/{orderId}")
    public ResponseEntity<?> updateFeedback(Authentication auth, @PathVariable String orderId, @RequestBody RestaurantRatingRequest request) {
        String email = auth.getName();
        Customer customer = customerRepository.findByEmail(email);
        if (customer == null) {
            return ResponseEntity.badRequest().body("Customer not found");
        }

        Feedback feedback = feedbackRepository.findAll().stream()
                .filter(f -> f.getOrder() != null && f.getOrder().getOrderId().equals(orderId))
                .filter(f -> f.getCustomer() != null && f.getCustomer().getCustomerId().equals(customer.getCustomerId()))
                .findFirst()
                .orElse(null);

        if (feedback == null) {
            return ResponseEntity.status(404).body("No feedback found for this order by you.");
        }

        feedback.setRestaurantRating(request.getRating());
        feedback.setRestaurantReview(request.getReview());
        feedbackRepository.save(feedback);

        // Update restaurant average
        RestaurantOwner restaurant = feedback.getRestaurant();
        List<Feedback> restaurantFeedbacks = feedbackRepository.findAll().stream()
                .filter(f -> f.getRestaurant() != null && f.getRestaurant().getRestaurantId().equals(restaurant.getRestaurantId()))
                .filter(f -> f.getRestaurantRating() > 0)
                .toList();

        double avgRating = restaurantFeedbacks.stream()
                .mapToInt(Feedback::getRestaurantRating)
                .average()
                .orElse(0.0);

        restaurant.setRating((float) avgRating);
        restaurantOwnerRepository.save(restaurant);

        return ResponseEntity.ok("Feedback updated successfully. New average rating: " + avgRating);
    }
}