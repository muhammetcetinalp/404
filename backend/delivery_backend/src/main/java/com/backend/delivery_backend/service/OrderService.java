package com.backend.delivery_backend.service;

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
                             String cardNumber, String expiryDate, String cvc) {

        Order order = new Order();
        order.setOrderId("order-" + UUID.randomUUID());
        order.setCustomer(customer);
        order.setItems(new HashMap<>(cart.getItems()));
        order.setDeliveryAddress(deliveryAddress);
        order.setPaymentMethod(paymentMethod);
        order.setDeliveryType(deliveryType);
        order.setOrderStatus("PENDING");
        order.setOrderDate(LocalDateTime.now());

        double total = cart.getItems().entrySet().stream()
                .mapToDouble(entry -> entry.getKey().getPrice() * entry.getValue())
                .sum();
        order.setTotalAmount(total);

        orderRepository.save(order);

        // Payment oluşturuluyor
        Payment payment = new Payment();
        payment.setPaymentId("pay-" + UUID.randomUUID());
        payment.setOrder(order);
        payment.setPaymentMethod(paymentMethod);
        payment.setPaymentStatus("PAID");
        payment.setPaymentDate(LocalDateTime.now());

        // Eğer kredi kartı seçildiyse bu bilgileri maskeleyerek ekleyelim
        if ("CREDIT_CARD".equalsIgnoreCase(paymentMethod)) {
            payment.setCardNumber(maskCardNumber(cardNumber));
            payment.setExpiryDate(expiryDate);
            payment.setCvc("****"); // İsteğe bağlı olarak saklamayabiliriz
        }

        paymentRepository.save(payment);

        cart.getItems().clear();
        cartRepository.save(cart);

        return order;
    }

    private String maskCardNumber(String number) {
        if (number == null || number.length() < 4) return "****";
        return "**** **** **** " + number.substring(number.length() - 4);
    }
}