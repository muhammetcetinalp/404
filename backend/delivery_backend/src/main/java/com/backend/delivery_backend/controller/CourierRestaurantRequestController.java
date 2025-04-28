package com.backend.delivery_backend.controller;

import com.backend.delivery_backend.DTO.CourierRestaurantRequestDTO;
import com.backend.delivery_backend.service.CourierRestaurantRequestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;

import java.util.List;
import com.backend.delivery_backend.model.CourierRestaurantRequest;
import com.backend.delivery_backend.repository.CourierRestaurantRequestRepository;
import java.util.Map;
import java.util.HashMap;
import com.backend.delivery_backend.repository.OrderRepository;

import java.util.stream.Collectors;

// Eksik import'lar
import com.backend.delivery_backend.model.Courier;
import com.backend.delivery_backend.model.RestaurantOwner;
import com.backend.delivery_backend.repository.CourierRepository;
import com.backend.delivery_backend.repository.RestaurantOwnerRepository;
import com.backend.delivery_backend.ENUM.RequestStatus;

@RestController
@RequestMapping("/api/courier-requests")
public class CourierRestaurantRequestController {

    @Autowired
    private CourierRestaurantRequestService requestService;

    @Autowired
    private CourierRestaurantRequestRepository requestRepository;

    @Autowired
    private OrderRepository orderRepository;

    // Eksik repository'ler
    @Autowired
    private CourierRepository courierRepository;

    @Autowired
    private RestaurantOwnerRepository restaurantRepository;

    @PostMapping("/send")
    public ResponseEntity<?> sendRequest(@RequestParam String courierId, @RequestParam String restaurantId) {
        try {
            requestService.sendRequest(courierId, restaurantId);
            return ResponseEntity.ok("Request sent successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/restaurant/{restaurantId}")
    public ResponseEntity<?> getRequestsForRestaurant(@PathVariable String restaurantId) {
        List<CourierRestaurantRequestDTO> requests = requestService.getRequestsForRestaurant(restaurantId);
        return ResponseEntity.ok(requests);
    }

    @PostMapping("/restaurant/respond")
    public ResponseEntity<?> respondRequest(@RequestParam Long requestId, @RequestParam String action, Authentication auth) {
        try {
            boolean isRestaurantOwner = auth.getAuthorities().stream()
                    .map(GrantedAuthority::getAuthority)
                    .anyMatch(role -> role.equals("ROLE_RESTAURANT_OWNER"));

            if (!isRestaurantOwner) {
                return ResponseEntity.status(403).body("Access denied. Only restaurant owners can respond to requests.");
            }

            requestService.respondRequest(requestId, action);
            return ResponseEntity.ok("Request " + action.toLowerCase() + "ed");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/courier/{courierId}/restaurant-relationships")
    public ResponseEntity<?> getCourierRestaurantRelationships(@PathVariable String courierId) {
        List<CourierRestaurantRequest> requests = requestRepository.findByCourierCourierId(courierId);

        // DTO'ya dönüştür
        List<Map<String, Object>> relationships = requests.stream()
                .map(r -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("requestId", r.getId());
                    map.put("restaurantId", r.getRestaurant().getRestaurantId());
                    map.put("restaurantName", r.getRestaurant().getName());
                    map.put("status", r.getStatus().toString());
                    map.put("createdAt", r.getCreatedAt());
                    // İstatistik verisi ekle
                    Long totalOrders = orderRepository.countByCourierIdAndRestaurantId(courierId, r.getRestaurant().getRestaurantId());
                    map.put("totalOrders", totalOrders != null ? totalOrders : 0);
                    return map;
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(relationships);
    }

    @PostMapping("/cancel")
    public ResponseEntity<?> cancelRequest(@RequestParam String courierId, @RequestParam String restaurantId) {
        try {
            System.out.println("Cancelling request for courier: " + courierId + ", restaurant: " + restaurantId);

            Courier courier = courierRepository.findByCourierId(courierId);
            RestaurantOwner restaurant = restaurantRepository.findByRestaurantId(restaurantId);

            if (courier == null || restaurant == null) {
                return ResponseEntity.badRequest().body("Courier or restaurant not found");
            }

            // Tüm istekleri bul ve PENDING olanları filtrele
            List<CourierRestaurantRequest> requests = requestRepository.findByCourierCourierId(courierId);
            List<CourierRestaurantRequest> pendingRequests = requests.stream()
                    .filter(r -> r.getRestaurant().getRestaurantId().equals(restaurantId)
                            && r.getStatus() == RequestStatus.PENDING)
                    .collect(Collectors.toList());

            if (pendingRequests.isEmpty()) {
                return ResponseEntity.badRequest().body("No pending request found");
            }

            // İsteği sil
            for (CourierRestaurantRequest request : pendingRequests) {
                System.out.println("Deleting request with ID: " + request.getId());
                requestRepository.delete(request);
            }

            return ResponseEntity.ok("Request cancelled successfully");
        } catch (Exception e) {
            System.err.println("Error cancelling request: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
}