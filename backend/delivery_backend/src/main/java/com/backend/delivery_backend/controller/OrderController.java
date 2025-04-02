package com.backend.delivery_backend.controller;

import com.backend.delivery_backend.model.*;
import com.backend.delivery_backend.repository.*;
import com.backend.delivery_backend.service.OrderService;
import com.backend.delivery_backend.DTO.CardInfoDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired private CustomerRepository customerRepository;
    @Autowired private CartRepository cartRepository;
    @Autowired private OrderRepository orderRepository;
    @Autowired private OrderService orderService;
    @Autowired private MenuItemRepository menuItemRepository;


    @PreAuthorize("hasRole('CUSTOMER')")
    @PostMapping("/create")
    public ResponseEntity<?> createOrder(Authentication auth,
                                         @RequestParam String deliveryAddress,
                                         @RequestParam String paymentMethod,
                                         @RequestParam DeliveryType deliveryType,
                                         @RequestParam(required = false) Double tipAmount,
                                         @RequestBody(required = false) CardInfoDTO cardInfo) {
        String email = auth.getName();
        Customer customer = customerRepository.findByEmail(email);
        if (customer == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Customer not found");
        }

        // Her item'ın restoranı aynı mı ve tipi destekliyor mu?
        /*for (MenuItem item : cart.getItems().keySet()) {
            RestaurantOwner restaurant = item.getRestaurant();
            DeliveryType supported = restaurant.getDeliveryType();
            if (!(supported == DeliveryType.BOTH || supported == deliveryType)) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("Restaurant " + restaurant.getName() + " does not support " + deliveryType + ".");
            }
        }*/

        Cart cart = cartRepository.findByCustomerId(customer.getCustomerId());
        if (cart == null || cart.getItems().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Cart is empty");
        }

        // Eğer ödeme yöntemi kredi kartıysa, kart bilgisi kontrolü yap
        if (paymentMethod.equalsIgnoreCase("CREDIT_CARD")) {
            if (cardInfo == null ||
                    cardInfo.getCardNumber() == null ||
                    cardInfo.getExpiryDate() == null ||
                    cardInfo.getCvv() == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("Card info is required for credit card payment");
            }
        }

        // Siparişi oluştur
        Order order = orderService.createOrder(
                customer,
                cart,
                deliveryAddress,
                paymentMethod,
                deliveryType,
                cardInfo != null ? cardInfo.getCardNumber() : null,
                cardInfo != null ? cardInfo.getExpiryDate() : null,
                cardInfo != null ? cardInfo.getCvv() : null,
                tipAmount
        );

        return ResponseEntity.ok(Map.of(
                "message", "Order placed successfully",
                "orderId", order.getOrderId(),
                "total", order.getTotalAmount(),
                "tip", order.getTipAmount()
        ));
    }

    @PreAuthorize("hasRole('CUSTOMER')")
    @GetMapping("/history")
    public ResponseEntity<?> getOrderHistory(Authentication auth) {
        String email = auth.getName();
        Customer customer = customerRepository.findByEmail(email);

        if (customer == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Customer not found");
        }

        Set<Order> orders = customer.getOrders();

        if (orders == null || orders.isEmpty()) {
            return ResponseEntity.ok("No previous orders found.");
        }

        List<Map<String, Object>> response = new ArrayList<>();
        for (Order order : orders) {
            Map<String, Object> orderData = new LinkedHashMap<>();
            orderData.put("orderId", order.getOrderId());
            orderData.put("orderDate", order.getOrderDate());
            orderData.put("deliveryAddress", order.getDeliveryAddress());
            orderData.put("totalAmount", order.getTotalAmount());
            orderData.put("orderStatus", order.getOrderStatus());
            orderData.put("deliveryType", order.getDeliveryType());
            orderData.put("tipAmount", order.getTipAmount());

            List<Map<String, Object>> itemsList = new ArrayList<>();
            for (Map.Entry<MenuItem, Integer> entry : order.getItems().entrySet()) {
                MenuItem item = entry.getKey();
                Map<String, Object> itemMap = new HashMap<>();
                itemMap.put("name", item.getName());
                itemMap.put("description", item.getDescription());
                itemMap.put("price", item.getPrice());
                itemMap.put("quantity", entry.getValue());
                itemsList.add(itemMap);
            }
            orderData.put("items", itemsList);

            response.add(orderData);
        }

        return ResponseEntity.ok(response);
    }

    @PreAuthorize("hasRole('CUSTOMER')")
    @DeleteMapping("/remove")
    public ResponseEntity<?> removeFromCart(Authentication auth,
                                            @RequestParam Long menuItemId) {
        String email = auth.getName();
        Customer customer = customerRepository.findByEmail(email);
        if (customer == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Customer not found");
        }

        Cart cart = cartRepository.findByCustomerId(customer.getCustomerId());
        if (cart == null || cart.getItems().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Cart is empty");
        }

        Optional<MenuItem> optionalItem = menuItemRepository.findById(menuItemId);
        if (optionalItem.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Menu item not found");
        }

        MenuItem menuItem = optionalItem.get();

        if (!cart.getItems().containsKey(menuItem)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Item not in cart");
        }

        int currentQty = cart.getItems().get(menuItem);
        if (currentQty > 1) {
            cart.getItems().put(menuItem, currentQty - 1);
        } else {
            cart.getItems().remove(menuItem);
        }

        cartRepository.save(cart);
        return ResponseEntity.ok("Item quantity updated in cart");
    }
    @PreAuthorize("hasRole('CUSTOMER')")
    @DeleteMapping("/remove-all")
    public ResponseEntity<?> removeAllFromCart(Authentication auth,
                                               @RequestParam Long menuItemId) {
        String email = auth.getName();
        Customer customer = customerRepository.findByEmail(email);
        if (customer == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Customer not found");
        }

        Cart cart = cartRepository.findByCustomerId(customer.getCustomerId());
        if (cart == null || cart.getItems().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Cart is empty");
        }

        Optional<MenuItem> optionalItem = menuItemRepository.findById(menuItemId);
        if (optionalItem.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Menu item not found");
        }

        MenuItem menuItem = optionalItem.get();

        if (!cart.getItems().containsKey(menuItem)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Item not in cart");
        }

        cart.getItems().remove(menuItem); // direkt tümünü kaldır
        cartRepository.save(cart);

        return ResponseEntity.ok("Item completely removed from cart");
    }
}