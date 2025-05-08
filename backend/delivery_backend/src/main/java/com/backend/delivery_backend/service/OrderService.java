package com.backend.delivery_backend.service;

import com.backend.delivery_backend.ENUM.DeliveryType;
import com.backend.delivery_backend.ENUM.OrderStatus;

import com.backend.delivery_backend.model.*;
import com.backend.delivery_backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import com.backend.delivery_backend.model.Order;
import com.backend.delivery_backend.repository.OrderRepository;
// Assuming your User model (or a sub-model like Customer) has an email field
// and Order model has a reference to the Customer who placed it.
// import com.backend.delivery_backend.model.Customer;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;
// If OrderRepository.findByOrderId returns Optional<Order>
// import java.util.Optional;
import java.util.*;

@Service
public class OrderService {

    @Autowired private CustomerRepository customerRepository;
    @Autowired private CartRepository cartRepository;
    @Autowired private OrderRepository orderRepository;
    @Autowired private PaymentRepository paymentRepository;  //Yeni eklendi


    public Order createOrder(Customer customer, Cart cart, String deliveryAddress,
                             String paymentMethod, DeliveryType deliveryType,
                             String cardNumber, String expiryDate, String cvc,
                             Double tipAmount) {

        Order order = new Order();
        order.setOrderId("order-" + UUID.randomUUID());
        order.setCustomer(customer);
        order.setItems(new HashMap<>(cart.getItems()));
        order.setDeliveryAddress(deliveryAddress);
        order.setPaymentMethod(paymentMethod);
        order.setDeliveryType(deliveryType);
        order.setOrderStatus(OrderStatus.PENDING.name()); // Enum kullanmak daha iyi
        order.setOrderDate(LocalDateTime.now());

        if (!cart.getItems().isEmpty()) {
            MenuItem firstItem = cart.getItems().keySet().iterator().next();
            RestaurantOwner restaurant = firstItem.getRestaurant();
            order.setRestaurant(restaurant);
        }

        double itemsTotal = cart.getItems().entrySet().stream()
                .mapToDouble(entry -> entry.getKey().getPrice() * entry.getValue())
                .sum();

        // Toplam = ürünler + tip (bahşiş)
        double total = itemsTotal + (tipAmount != null ? tipAmount : 0.0);
        order.setTotalAmount(total);

        if (tipAmount != null && tipAmount > 0) {
            order.setTipAmount(tipAmount);
        }

        orderRepository.save(order);

        // Payment işlemleri
        Payment payment = new Payment();
        payment.setPaymentId("pay-" + UUID.randomUUID());
        payment.setOrder(order);
        payment.setPaymentMethod(paymentMethod);
        payment.setPaymentStatus("PAID");
        payment.setPaymentDate(LocalDateTime.now());

        if ("CREDIT_CARD".equalsIgnoreCase(paymentMethod)) {
            payment.setCardNumber(maskCardNumber(cardNumber));
            payment.setExpiryDate(expiryDate);
            payment.setCvc("****");
        }

        paymentRepository.save(payment);

        // Sepeti temizle
        cart.getItems().clear();
        cartRepository.save(cart);

        return order;
    }

    private String maskCardNumber(String number) {
        if (number == null || number.length() < 4) return "****";
        return "**** **** **** " + number.substring(number.length() - 4);
    }

    @Transactional
    public void cancelOrder(String orderId) throws Exception {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new SecurityException("User not authenticated.");
        }
        String currentPrincipalName = authentication.getName(); // This is typically the email for JWT auth

        // Use the standard findById method from JpaRepository, as orderId is the @Id
        // This method returns Optional<Order>
        Optional<Order> orderOptional = orderRepository.findById(orderId);

        if (orderOptional.isEmpty()) {
            throw new Exception("Order not found with ID: " + orderId + ".");
        }
        Order order = orderOptional.get(); // Get the Order object from Optional

        // Verify ownership: Compare the email from JWT (principal name) with the order's customer email.
        // Assuming order.getCustomer() returns a Customer object which has getEmail().
        if (order.getCustomer() == null || !order.getCustomer().getEmail().equals(currentPrincipalName)) {
            throw new SecurityException("Unauthorized: You are not allowed to cancel this order.");
        }

        // Check if order status is PENDING or IN_PROGRESS (case-insensitive for robustness)
        String currentStatus = order.getOrderStatus();
        if (currentStatus == null) {
            // This case should ideally not happen if orderStatus is non-nullable or has a default
            throw new Exception("Order status is not defined for order ID: " + orderId + ".");
        }

        List<String> cancellableStatuses = Arrays.asList("PENDING", "IN_PROGRESS");

        if (!cancellableStatuses.contains(currentStatus.toUpperCase())) {
            throw new Exception("Order cannot be cancelled. Current status: " + order.getOrderStatus() + ".");
        }

        // Update order status to CANCELLED
        order.setOrderStatus(OrderStatus.CANCELLED_BY_CUSTOMER.name()); // <<--- DEĞİŞİKLİK BURADA
        orderRepository.save(order);
    }
}