package com.backend.delivery_backend.service;

import com.backend.delivery_backend.ENUM.DeliveryType;
import com.backend.delivery_backend.model.*;
import com.backend.delivery_backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
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
        order.setOrderStatus("PENDING");
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
}