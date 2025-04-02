package com.backend.delivery_backend.service;

import com.backend.delivery_backend.DTO.FeedbackDTO;
import com.backend.delivery_backend.model.*;
import com.backend.delivery_backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class FeedbackService {

    @Autowired
    private CourierRepository courierRepository;

    @Autowired
    private RestaurantOwnerRepository restaurantOwnerRepository;

    @Autowired
    private OrderRepository orderRepository;

    public void submitFeedback(String customerEmail, FeedbackDTO dto) {
        Order order = orderRepository.findById(dto.getOrderId())
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (!order.getCustomer().getEmail().equals(customerEmail)) {
            throw new RuntimeException("This order does not belong to the authenticated customer.");
        }

        if ("COURIER".equalsIgnoreCase(dto.getTargetType())) {
            Courier courier = courierRepository.findById(dto.getTargetId())
                    .orElseThrow(() -> new RuntimeException("Courier not found"));
            System.out.println("Courier feedback -> Rating: " + dto.getRating() + ", Comment: " + dto.getComment());
            // Gerekirse burada courier.setRating() vs. yapılabilir
        } else if ("RESTAURANT".equalsIgnoreCase(dto.getTargetType())) {
            RestaurantOwner restaurant = restaurantOwnerRepository.findById(dto.getTargetId())
                    .orElseThrow(() -> new RuntimeException("Restaurant not found"));
            System.out.println("Restaurant feedback -> Rating: " + dto.getRating() + ", Comment: " + dto.getComment());
            // Gerekirse burada restaurant.setRating() vs. yapılabilir
        } else {
            throw new RuntimeException("Invalid feedback target type");
        }
    }
}