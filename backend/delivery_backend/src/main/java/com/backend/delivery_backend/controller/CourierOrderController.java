package com.backend.delivery_backend.controller;

import com.backend.delivery_backend.model.Courier;
import com.backend.delivery_backend.model.Order;
import com.backend.delivery_backend.repository.CourierRepository;
import com.backend.delivery_backend.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/courier/orders")
public class CourierOrderController {

    @Autowired
    private CourierRepository courierRepository;

    @Autowired
    private OrderRepository orderRepository;

    // ➔ Kuryeye atanmış siparişleri listele
    @GetMapping("/assigned")
    public ResponseEntity<?> getAssignedOrdersForCourier(Authentication auth) {
        String email = auth.getName();
        Courier courier = courierRepository.findByEmail(email);

        if (courier == null) {
            return ResponseEntity.badRequest().body("Courier not found.");
        }

        List<Order> assignedOrders = orderRepository.findByCourierId(courier.getCourierId());
        return ResponseEntity.ok(assignedOrders);
    }

    // ➔ Aktif siparişleri listele
    @GetMapping("/active")
    public ResponseEntity<?> getActiveOrdersForCourier(Authentication auth) {
        String email = auth.getName();
        Courier courier = courierRepository.findByEmail(email);

        if (courier == null || courier.getRestaurantOwner() == null) {
            return ResponseEntity.badRequest().body("Courier not assigned to any restaurant.");
        }

        String restaurantId = courier.getRestaurantOwner().getRestaurantId();

        List<Order> activeOrders = orderRepository.findByRestaurantId(restaurantId).stream()
                .filter(order -> "READY".equals(order.getOrderStatus()))
                .toList();

        return ResponseEntity.ok(activeOrders);
    }

    // ➔ Siparişi kabul et
    @PatchMapping("/accept/{orderId}")
    public ResponseEntity<?> acceptOrder(@PathVariable String orderId, Authentication auth) {
        String email = auth.getName();
        Courier courier = courierRepository.findByEmail(email);

        if (courier == null || courier.getRestaurantOwner() == null) {
            return ResponseEntity.badRequest().body("Courier not assigned to any restaurant.");
        }

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found."));

        // Sipariş kuryenin restoranına mı ait kontrolü
        if (!order.getRestaurant().getRestaurantId().equals(courier.getRestaurantOwner().getRestaurantId())) {
            return ResponseEntity.status(403).body("You can only accept orders from your own restaurant.");
        }

        // Sipariş başka bir kurye tarafından alınmış mı kontrolü
        if (order.getCourier() != null) {
            return ResponseEntity.badRequest().body("This order has already been accepted by another courier.");
        }

        // Siparişi kabul et
        order.setCourier(courier);
        orderRepository.save(order);

        return ResponseEntity.ok("Order accepted successfully.");
    }

    // CourierOrderController.java içine
    @GetMapping("/available")
    public ResponseEntity<?> getAvailableOrders(Authentication auth) {
        String email = auth.getName();
        Courier courier = courierRepository.findByEmail(email);

        if (courier == null || courier.getRestaurantOwner() == null) {
            return ResponseEntity.badRequest().body("Courier not assigned to any restaurant.");
        }

        String restaurantId = courier.getRestaurantOwner().getRestaurantId();


        // Bu restorana ait PENDING, IN_PROGRESS, PREPARING veya READY durumundaki siparişleri getir
        List<Order> availableOrders = orderRepository.findByRestaurantId(restaurantId).stream()
                .filter(order -> "READY".equals(order.getOrderStatus()))
                .toList();

        return ResponseEntity.ok(availableOrders);
    }
    @PatchMapping("/accept-available/{orderId}")
    public ResponseEntity<?> acceptAvailableOrder(@PathVariable String orderId, Authentication auth) {
        String email = auth.getName();
        Courier courier = courierRepository.findByEmail(email);

        if (courier == null || courier.getRestaurantOwner() == null) {
            return ResponseEntity.badRequest().body("Courier not assigned to any restaurant.");
        }

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found."));

        // Sipariş zaten bir kuryeye atanmış mı?
        if (order.getCourier() != null) {
            return ResponseEntity.badRequest().body("Order has already been accepted by another courier.");
        }

        // Sipariş kuryenin restoranına mı ait?
        if (!order.getRestaurant().getRestaurantId().equals(courier.getRestaurantOwner().getRestaurantId())) {
            return ResponseEntity.status(403).body("You can only accept orders from your own restaurant.");
        }

        // Siparişi kendine ata
        order.setCourier(courier);
        orderRepository.save(order);

        return ResponseEntity.ok("Order accepted successfully.");
    }

    @PatchMapping("/update-status/{orderId}")
    public ResponseEntity<?> updateOrderStatus(@PathVariable String orderId, @RequestBody Map<String, String> requestBody) {
        String newStatus = requestBody.get("status");
        
        if (newStatus == null) {
            return ResponseEntity.badRequest().body("Status field is required");
        }
        
        // If it's a JSON object containing status, just use the raw string value
        if (newStatus.contains("{") || newStatus.contains(":")) {
            try {
                // Just take the plain string value without parsing as JSON
                newStatus = newStatus.replaceAll("[{}\"]", "").replaceAll("status:", "").trim();
            } catch (Exception e) {
                // If there's an error, just proceed with the original value
                System.err.println("Error parsing status: " + e.getMessage());
            }
        }
        
        // Standardize the status format
        newStatus = newStatus.replace("\"", "").toUpperCase().trim();
        
        // Special case for "picked up" format
        if (newStatus.equals("PICKED UP")) {
            newStatus = "PICKED_UP";
        }
        
        // Log the final status value for debugging
        System.out.println("Setting order status to: " + newStatus);
        
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found."));

        order.setOrderStatus(newStatus);
        orderRepository.save(order);

        return ResponseEntity.ok("Order status updated successfully to " + newStatus);
    }


}