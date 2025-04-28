package com.backend.delivery_backend.controller;

import com.backend.delivery_backend.DTO.RestaurantOrderDTO;
import com.backend.delivery_backend.ENUM.DeliveryType;
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
    @Autowired private RestaurantOwnerRepository restaurantOwnerRepository;


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

        // Müşteri ban edilmişse sipariş veremez
        if ("BANNED".equals(customer.getAccountStatus())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Your account has been banned. You cannot place orders.");
        }

        // Askıya alınan müşteri sipariş veremez
        if ("SUSPENDED".equals(customer.getAccountStatus())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Your account has been suspended. You cannot place orders at this time.");
        }

        Cart cart = cartRepository.findByCustomerId(customer.getCustomerId());
        if (cart == null || cart.getItems().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Cart is empty");
        }

        // Sepetteki ilk ürünün restoranını kontrol et
        MenuItem firstItem = cart.getItems().keySet().iterator().next();
        RestaurantOwner restaurant = firstItem.getRestaurant();

        // Restoran ban edilmiş veya askıya alınmışsa sipariş verilemez
        if ("BANNED".equals(restaurant.getAccountStatus()) || "SUSPENDED".equals(restaurant.getAccountStatus())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("The restaurant is currently unavailable. Your order cannot be processed.");
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
            return ResponseEntity.ok(Collections.emptyList());
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

    // In OrderController.java - Need to add this method


    // In OrderController.java - Add this method
    @PreAuthorize("hasRole('RESTAURANT_OWNER')")
    @PatchMapping("/status/{orderId}")
    public ResponseEntity<?> updateOrderStatus(
            @PathVariable String orderId,
            @RequestBody Map<String, String> statusUpdate) {

        try {
            String newStatus = statusUpdate.get("status");
            if (newStatus == null) {
                return ResponseEntity.badRequest().body("Status field is required");
            }

            Optional<Order> orderOpt = orderRepository.findById(orderId);
            if (orderOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Order not found");
            }

            Order order = orderOpt.get();

            // Eğer "ACCEPTED" geldiyse, veritabanına "IN_PROGRESS" olarak yaz
            if (newStatus.equalsIgnoreCase("ACCEPTED")) {
                order.setOrderStatus("IN_PROGRESS");
            } else {
                order.setOrderStatus(newStatus);
            }

            orderRepository.save(order);
            return ResponseEntity.ok("Order status updated to " + order.getOrderStatus());

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error updating order status: " + e.getMessage());
        }
    }

    @PreAuthorize("hasRole('RESTAURANT_OWNER')")
    @GetMapping("/history/restaurant/{restaurantId}")
    public ResponseEntity<?> getPastOrdersByRestaurant(@PathVariable String restaurantId) {
        List<Order> orders = orderRepository.findByRestaurantId(restaurantId)
                .stream()
                .sorted(Comparator.comparing(Order::getOrderDate).reversed())
                .toList();
        if (orders.isEmpty()) {
            return ResponseEntity.ok(Collections.emptyList());
        }

        List<RestaurantOrderDTO> result = new ArrayList<>();

        for (Order order : orders) {
            RestaurantOrderDTO dto = new RestaurantOrderDTO();
            dto.setOrderId(order.getOrderId());
            dto.setOrderDate(order.getOrderDate());
            dto.setDeliveryAddress(order.getDeliveryAddress());
            dto.setTotalAmount(order.getTotalAmount());
            dto.setOrderStatus(order.getOrderStatus());
            dto.setDeliveryType(order.getDeliveryType().name());

            if (order.getCustomer() != null) {
                dto.setCustomerName(order.getCustomer().getName());
            } else {
                dto.setCustomerName("Unknown");
            }

            List<Map<String, Object>> itemList = new ArrayList<>();
            for (Map.Entry<MenuItem, Integer> entry : order.getItems().entrySet()) {
                Map<String, Object> item = new HashMap<>();
                item.put("name", entry.getKey().getName());
                item.put("price", entry.getKey().getPrice());
                item.put("quantity", entry.getValue());
                item.put("description", entry.getKey().getDescription());
                itemList.add(item);
            }

            dto.setItems(itemList);
            result.add(dto);
        }

        return ResponseEntity.ok(result);
    }

    @PatchMapping("/restaurants/{id}/toggle-status")
    public ResponseEntity<?> toggleRestaurantStatus(@PathVariable String id) {
        Optional<RestaurantOwner> optional = restaurantOwnerRepository.findById(id);
        if (optional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Restaurant not found");
        }

        RestaurantOwner restaurant = optional.get();
        restaurant.setOpen(!restaurant.isOpen());
        restaurantOwnerRepository.save(restaurant);

        return ResponseEntity.ok(Map.of(
                "message", "Restaurant status updated",
                "isOpen", restaurant.isOpen()
        ));
    }

}